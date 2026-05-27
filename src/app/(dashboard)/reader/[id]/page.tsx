import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Book from "@/models/Book";
import Chapter from "@/models/Chapter";
import ReadingProgress from "@/models/ReadingProgress";
import Bookmark from "@/models/Bookmark";
import { ReaderView } from "@/components/reader/reader-view";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  await dbConnect();

  const book = await Book.findById(id).lean();
  if (!book) notFound();

  const chapters = await Chapter.find({ bookId: id })
    .sort({ chapterNumber: 1 })
    .lean();

  const progress = await ReadingProgress.findOne({
    userId: session.user.id,
    bookId: id,
  }).lean();

  const bookmarks = await Bookmark.find({
    userId: session.user.id,
    bookId: id,
  }).lean();

  const serialized = {
    book: JSON.parse(JSON.stringify(book)),
    chapters: JSON.parse(JSON.stringify(chapters)),
    progress: progress ? JSON.parse(JSON.stringify(progress)) : null,
    bookmarks: JSON.parse(JSON.stringify(bookmarks)),
  };

  return <ReaderView data={serialized} />;
}
