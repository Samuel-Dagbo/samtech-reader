import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Book from "@/models/Book";
import ReadingProgress from "@/models/ReadingProgress";
import { notFound } from "next/navigation";
import { EditBookForm } from "@/components/admin/edit-book-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionLabel } from "@/components/ui/section";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { StatCard } from "@/components/ui/stat-card";
import { Users, BookCheck, BookOpen, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/");

  const { id } = await params;
  await dbConnect();

  const book = await Book.findById(id).lean();
  if (!book) notFound();

  const [stats] = await ReadingProgress.aggregate([
    { $match: { bookId: book._id } },
    {
      $group: {
        _id: null,
        uniqueReaders: { $sum: 1 },
        finished: { $sum: { $cond: [{ $gte: ["$percentage", 100] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $and: [{ $gt: ["$percentage", 0] }, { $lt: ["$percentage", 100] }] }, 1, 0] } },
        avgPct: { $avg: "$percentage" },
      },
    },
  ]);

  const bookStats = {
    readers: stats?.uniqueReaders ?? 0,
    finished: stats?.finished ?? 0,
    inProgress: stats?.inProgress ?? 0,
    avgCompletion: Math.round(stats?.avgPct ?? 0),
  };

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
      <FadeUp>
        <div className="mb-6">
          <SectionLabel>Editing</SectionLabel>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-balance">
            {book.title}
          </h1>
          <p className="mt-2 text-muted-foreground">by {book.author}</p>
        </div>
      </FadeUp>

      <FadeUp delay={0.05}>
        <div className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3 inline-flex items-center gap-2">
            <span className="h-px w-6 bg-gradient-to-r from-primary to-primary/30" />
            Reader insights
          </h2>
          <StaggerContainer className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <StaggerItem>
              <StatCard
                label="Total readers"
                value={bookStats.readers}
                icon={Users}
                accent="primary"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                label="In progress"
                value={bookStats.inProgress}
                icon={BookOpen}
                accent="info"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                label="Finished"
                value={bookStats.finished}
                icon={BookCheck}
                accent="success"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                label="Avg completion"
                value={`${bookStats.avgCompletion}%`}
                icon={TrendingUp}
                accent="warning"
              />
            </StaggerItem>
          </StaggerContainer>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <EditBookForm book={serialized} />
      </FadeUp>
    </div>
  );
}
