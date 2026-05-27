import dbConnect from "@/lib/db";
import Book from "@/models/Book";
import Chapter from "@/models/Chapter";
import ReadingProgress from "@/models/ReadingProgress";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { BookDetailClient } from "./book-detail-client";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();
  const book = await Book.findById(id).lean();
  if (!book) return { title: "Book Not Found" };
  return {
    title: `${book.title} by ${book.author} - SamTech Reader`,
    description: book.description.slice(0, 160),
    openGraph: {
      title: book.title,
      description: book.description.slice(0, 160),
      images: book.coverImage ? [book.coverImage] : [],
    },
  };
}

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();

  const book = await Book.findById(id).lean();
  if (!book) notFound();

  const chapters = await Chapter.find({ bookId: id })
    .sort({ chapterNumber: 1 })
    .select("chapterNumber title wordCount")
    .lean();

  const session = await auth();
  let progress = null;
  if (session?.user?.id) {
    progress = await ReadingProgress.findOne({
      userId: session.user.id,
      bookId: id,
    }).lean();
  }

  const serialized = {
    book: JSON.parse(JSON.stringify(book)),
    chapters: JSON.parse(JSON.stringify(chapters)),
    progress: progress ? JSON.parse(JSON.stringify(progress)) : null,
  };

  return <BookDetailClient data={serialized} isLoggedIn={!!session?.user?.id} />;
}
