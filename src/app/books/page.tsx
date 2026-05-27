import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Book from "@/models/Book";
import ReadingProgress from "@/models/ReadingProgress";
import { BooksClient } from "./books-client";

export const metadata: Metadata = {
  title: "Browse Books - SamTech Reader",
  description: "Discover and read books online. Browse our library of books across various genres.",
};

export const dynamic = "force-dynamic";

export default async function BooksPage() {
  const session = await auth();
  await dbConnect();

  const books = await Book.find().sort({ createdAt: -1 }).lean();

  let progressMap: Record<string, number> = {};
  if (session?.user?.id) {
    const progress = await ReadingProgress.find({
      userId: session.user.id,
      percentage: { $gt: 0 },
    }).lean();

    for (const p of progress) {
      progressMap[p.bookId.toString()] = p.percentage;
    }
  }

  const serialized = books.map((book) => ({
    _id: book._id.toString(),
    title: book.title,
    description: book.description,
    author: book.author,
    coverImage: book.coverImage || "",
    genre: book.genre || "",
    totalChapters: book.totalChapters,
    readingTime: book.readingTime,
    readingProgress: progressMap[book._id.toString()] || 0,
  }));

  return <BooksClient books={serialized} />;
}
