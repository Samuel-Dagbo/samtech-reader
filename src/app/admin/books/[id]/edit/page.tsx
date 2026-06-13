import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Book from "@/models/Book";
import { notFound } from "next/navigation";
import { EditBookForm } from "@/components/admin/edit-book-form";

export const dynamic = "force-dynamic";

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/");

  const { id } = await params;
  await dbConnect();
  const book = await Book.findById(id).lean();
  if (!book) notFound();

  const serialized = {
    _id: String(book._id),
    title: book.title,
    author: book.author,
    description: book.description,
    genre: book.genre || "",
    tags: book.tags || "",
    coverImage: book.coverImage || "",
    totalChapters: book.totalChapters,
    totalPages: book.totalPages,
    readingTime: book.readingTime,
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <EditBookForm book={serialized} />
    </div>
  );
}
