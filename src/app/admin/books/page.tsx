import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Book from "@/models/Book";
import { FadeUp } from "@/components/ui/motion";
import { SectionLabel } from "@/components/ui/section";
import { BooksList } from "./books-list";

export const dynamic = "force-dynamic";

export default async function AdminBooksPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/");

  await dbConnect();
  const books = await Book.find().sort({ createdAt: -1 }).lean();

  const serialized = books.map((b) => ({
    _id: b._id.toString(),
    title: b.title,
    author: b.author,
    coverImage: b.coverImage || "",
    totalChapters: b.totalChapters,
    readingTime: b.readingTime,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <FadeUp>
        <div className="mb-6">
          <SectionLabel>Library management</SectionLabel>
        </div>
      </FadeUp>
      <FadeUp delay={0.05}>
        <BooksList books={serialized} />
      </FadeUp>
    </div>
  );
}
