import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Book from "@/models/Book";
import Chapter from "@/models/Chapter";
import { uploadBufferToCloudinary, deleteFromCloudinary, cloudinary } from "@/lib/cloudinary";
import { parsePdfBuffer } from "@/lib/pdf-processor";
import { calculateReadingTime } from "@/lib/utils";
import { bookSchema } from "@/lib/validations";

export const maxDuration = 60;
export const runtime = "nodejs";

async function fetchPdfBuffer(url: string, publicId?: string): Promise<Buffer> {
  let fetchUrl = url;
  if (publicId) {
    fetchUrl = cloudinary.utils.private_download_url(publicId, "pdf", {
      resource_type: "raw",
      type: "upload",
      attachment: false,
    });
  }
  const response = await fetch(fetchUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF from Cloudinary: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function POST(req: Request) {
  let uploadedPdfId: string | null = null;
  let uploadedCoverId: string | null = null;

  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const author = formData.get("author") as string;
    const genre = (formData.get("genre") as string) || "";
    const tags = (formData.get("tags") as string) || "";

    // Support both direct file upload and Cloudinary URL upload
    const cloudinaryUrl = formData.get("cloudinaryUrl") as string | null;
    const cloudinaryPdfId = formData.get("cloudinaryPdfId") as string | null;
    const pdfFile = formData.get("pdf") as File | null;
    const coverFile = formData.get("cover") as File | null;

    const parsed = bookSchema.safeParse({ title, description, author, genre, tags });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }

    if (!cloudinaryUrl && (!pdfFile || pdfFile.size === 0)) {
      return NextResponse.json({ error: "PDF file or Cloudinary URL is required" }, { status: 400 });
    }

    await dbConnect();

    let pdfBuffer: Buffer;
    let pdfSecureUrl: string;
    let pdfPublicId: string;

    if (cloudinaryUrl) {
      // PDF already uploaded to Cloudinary by client - fetch it for processing
      pdfBuffer = await fetchPdfBuffer(cloudinaryUrl, cloudinaryPdfId || undefined);
      pdfSecureUrl = cloudinaryUrl;
      pdfPublicId = cloudinaryPdfId || `samtech-reader/pdfs/${cloudinaryUrl.split("/").pop()?.replace(/\.[^/.]+$/, "") || "unknown"}`;
    } else if (pdfFile && pdfFile.size > 0) {
      // Direct file upload - upload to Cloudinary first
      const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
      if (pdfFile.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `PDF file too large. Maximum size is 50MB.` },
          { status: 400 }
        );
      }

      if (pdfFile.type && pdfFile.type !== "application/pdf") {
        return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
      }

      pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());

      const pdfUpload = await uploadBufferToCloudinary(pdfBuffer, {
        folder: "samtech-reader/pdfs",
        resource_type: "raw",
      });
      pdfSecureUrl = pdfUpload.secure_url;
      pdfPublicId = pdfUpload.public_id;
      uploadedPdfId = pdfPublicId;
    } else {
      return NextResponse.json({ error: "No PDF provided" }, { status: 400 });
    }

    // Upload cover image if provided
    let coverImage = "";
    if (coverFile && coverFile.size > 0) {
      if (!coverFile.type?.startsWith("image/")) {
        return NextResponse.json({ error: "Cover must be an image file" }, { status: 400 });
      }
      const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
      const coverUpload = await uploadBufferToCloudinary(coverBuffer, {
        folder: "samtech-reader/covers",
        resource_type: "image",
      });
      coverImage = coverUpload.secure_url;
      uploadedCoverId = coverUpload.public_id;
    }

    // Parse PDF from buffer
    const { chapters, totalWords, totalPages } = await parsePdfBuffer(pdfBuffer);

    if (chapters.length === 0 || totalWords === 0) {
      if (uploadedPdfId) deleteFromCloudinary(uploadedPdfId).catch(() => {});
      if (uploadedCoverId) deleteFromCloudinary(uploadedCoverId).catch(() => {});
      return NextResponse.json(
        { error: "Could not extract any text from this PDF. It may be a scanned document." },
        { status: 400 }
      );
    }

    const readingTime = calculateReadingTime(chapters.map((c) => c.content).join(" "));

    const book = await Book.create({
      title,
      description,
      author,
      genre,
      tags,
      coverImage,
      cloudinaryCoverId: uploadedCoverId,
      pdfUrl: pdfSecureUrl,
      cloudinaryPdfId: pdfPublicId,
      totalChapters: chapters.length,
      totalPages,
      readingTime,
      uploadedBy: session.user.id,
    });

    const chapterDocs = chapters.map((ch) => ({
      bookId: book._id,
      chapterNumber: ch.chapterNumber,
      title: ch.title,
      content: ch.content,
      wordCount: ch.wordCount,
    }));

    await Chapter.insertMany(chapterDocs);

    return NextResponse.json(
      { book, chapterCount: chapters.length, totalWords, totalPages },
      { status: 201 }
    );
  } catch (error) {
    if (uploadedPdfId) {
      deleteFromCloudinary(uploadedPdfId).catch(() => {});
    }
    if (uploadedCoverId) {
      deleteFromCloudinary(uploadedCoverId).catch(() => {});
    }

    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process book" },
      { status: 500 }
    );
  }
}
