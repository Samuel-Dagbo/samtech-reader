import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Book from "@/models/Book";
import Chapter from "@/models/Chapter";
import { deleteFromCloudinary } from "@/lib/cloudinary";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();

    const book = await Book.findById(id).lean();
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const chapters = await Chapter.find({ bookId: id })
      .sort({ chapterNumber: 1 })
      .select("chapterNumber title wordCount")
      .lean();

    return NextResponse.json({ book, chapters });
  } catch {
    return NextResponse.json({ error: "Failed to fetch book" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const book = await Book.findById(id);
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Clean up Cloudinary files
    if (book.cloudinaryPdfId) {
      deleteFromCloudinary(book.cloudinaryPdfId).catch(() => {});
    }

    await Book.findByIdAndDelete(id);
    await Chapter.deleteMany({ bookId: id });

    return NextResponse.json({ message: "Book deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete book" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    await dbConnect();

    const book = await Book.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json(book);
  } catch {
    return NextResponse.json({ error: "Failed to update book" }, { status: 500 });
  }
}
