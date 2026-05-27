import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Book from "@/models/Book";
import Chapter from "@/models/Chapter";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { parsePdfText, downloadPdf, cleanupTempFile } from "@/lib/pdf-processor";
import { calculateReadingTime } from "@/lib/utils";

export async function POST(req: Request) {
  let tmpPath: string | null = null;

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

    if (!title || !description || !author || !pdfFile) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();

    const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());
    const pdfBase64 = pdfBuffer.toString("base64");
    const pdfDataUri = `data:application/pdf;base64,${pdfBase64}`;

    const pdfUpload = await uploadToCloudinary(pdfDataUri, {
      folder: "samtech-reader/pdfs",
      resource_type: "raw",
    });

    let coverImage = "";
    if (coverFile) {
      const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
      const coverBase64 = coverBuffer.toString("base64");
      const coverDataUri = `data:${coverFile.type};base64,${coverBase64}`;
      const coverUpload = await uploadToCloudinary(coverDataUri, {
        folder: "samtech-reader/covers",
        resource_type: "image",
      });
      coverImage = coverUpload.secure_url;
    }

    tmpPath = await downloadPdf(pdfUpload.secure_url);
    const { chapters, totalWords } = await parsePdfText(tmpPath);
    cleanupTempFile(tmpPath);
    tmpPath = null;

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
    if (tmpPath) cleanupTempFile(tmpPath);
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to process book" }, { status: 500 });
  }
}
