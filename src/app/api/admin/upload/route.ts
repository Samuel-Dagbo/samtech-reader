import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Book from "@/models/Book";
import Chapter from "@/models/Chapter";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import { parsePdfBuffer } from "@/lib/pdf-processor";
import { calculateReadingTime } from "@/lib/utils";
import { bookSchema } from "@/lib/validations";

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
    const pdfFile = formData.get("pdf") as File;
    const coverFile = formData.get("cover") as File | null;

    const parsed = bookSchema.safeParse({ title, description, author, genre, tags });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }

    if (!pdfFile || pdfFile.size === 0) {
      return NextResponse.json({ error: "PDF file is required" }, { status: 400 });
    }

    await dbConnect();

    const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());

    // Upload PDF to Cloudinary via stream
    const pdfUpload = await uploadBufferToCloudinary(pdfBuffer, {
      folder: "samtech-reader/pdfs",
      resource_type: "raw",
    });
    uploadedPdfId = pdfUpload.public_id;

    // Upload cover image if provided
    let coverImage = "";
    if (coverFile && coverFile.size > 0) {
      const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
      const coverUpload = await uploadBufferToCloudinary(coverBuffer, {
        folder: "samtech-reader/covers",
        resource_type: "image",
      });
      coverImage = coverUpload.secure_url;
      uploadedCoverId = coverUpload.public_id;
    }

    // Parse PDF directly from buffer
    const { chapters, totalWords } = await parsePdfBuffer(pdfBuffer);

    const readingTime = calculateReadingTime(chapters.map((c) => c.content).join(" "));

    const book = await Book.create({
      title,
      description,
      author,
      genre,
      tags,
      coverImage,
      pdfUrl: pdfUpload.secure_url,
      cloudinaryPdfId: pdfUpload.public_id,
      totalChapters: chapters.length,
      totalPages: chapters.length,
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
      { book, chapterCount: chapters.length, totalWords },
      { status: 201 }
    );
  } catch (error) {
    // Clean up Cloudinary files on failure
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
