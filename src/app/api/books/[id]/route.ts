import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Book from "@/models/Book";
import Chapter from "@/models/Chapter";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";

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
  } catch (error) {
    console.error("Book fetch error:", error);
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

    if (book.cloudinaryPdfId) {
      deleteFromCloudinary(book.cloudinaryPdfId).catch(() => {});
    }
    if (book.cloudinaryCoverId) {
      deleteFromCloudinary(book.cloudinaryCoverId).catch(() => {});
    }

    await Book.findByIdAndDelete(id);
    await Chapter.deleteMany({ bookId: id });

    return NextResponse.json({ message: "Book deleted" });
  } catch (error) {
    console.error("Book delete error:", error);
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
    await dbConnect();

    const existing = await Book.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      // Handle form data with optional cover upload
      const formData = await req.formData();
      const coverUrl = formData.get("coverUrl") as string | null;
      const coverPublicId = formData.get("coverPublicId") as string | null;

      const updates: Record<string, unknown> = {};
      for (const [key, value] of formData.entries()) {
        if (key !== "coverUrl" && key !== "coverPublicId" && typeof value === "string") {
          updates[key] = value;
        }
      }

      if (coverUrl && coverPublicId) {
        updates.coverImage = coverUrl;
        updates.cloudinaryCoverId = coverPublicId;

        // Delete old cover from Cloudinary
        if (existing.cloudinaryCoverId) {
          deleteFromCloudinary(existing.cloudinaryCoverId).catch(() => {});
        }
      }

      const book = await Book.findByIdAndUpdate(id, updates, { new: true }).lean();
      return NextResponse.json(book);
    }

    // JSON update (metadata only)
    const body = await req.json();
    const book = await Book.findByIdAndUpdate(id, body, { new: true }).lean();
    return NextResponse.json(book);
  } catch (error) {
    console.error("Book update error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update book" },
      { status: 500 }
    );
  }
}
