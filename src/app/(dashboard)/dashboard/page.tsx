import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import ReadingProgress from "@/models/ReadingProgress";
import Bookmark from "@/models/Bookmark";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { SectionLabel } from "@/components/ui/section";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { BookOpen, BookMarked, Clock, TrendingUp, ArrowRight, Flame, Quote } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard - SamTech Reader",
  description: "Your reading dashboard. Continue reading, view bookmarks, and track progress.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await dbConnect();

  const [recentProgress, bookmarks] = await Promise.all([
    ReadingProgress.find({ userId: session.user.id, percentage: { $gt: 0 } })
      .sort({ lastReadAt: -1 })
      .limit(10)
      .populate("bookId", "title author coverImage totalChapters")
      .lean(),
    Bookmark.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("bookId", "title")
      .lean(),
  ]);

  const totalProgress = recentProgress.reduce((sum, p) => sum + (p.percentage || 0), 0);
  const avgProgress = recentProgress.length > 0 ? Math.round(totalProgress / recentProgress.length) : 0;
  const finishedCount = recentProgress.filter((p) => p.percentage >= 100).length;
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 5) return "Burning the midnight oil";
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();
  const firstName = session.user.name?.split(" ")[0] ?? "Reader";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <FadeUp>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <SectionLabel>Dashboard</SectionLabel>
            <h1 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-balance">
              {greeting}, <span className="text-primary">{firstName}</span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              {recentProgress.length > 0
                ? `You're ${avgProgress}% through your current reads. Keep going.`
                : "Pick up a book and start your reading streak."}
            </p>
          </div>
          <Link href="/books">
            <Button variant="outline" className="gap-2 glass">
              <BookOpen className="h-4 w-4" /> Browse library <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </FadeUp>

      {recentProgress.length > 0 && (
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StaggerItem>
            <StatCard
              label="Books in progress"
              value={recentProgress.length}
              icon={BookOpen}
              accent="primary"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              label="Average progress"
              value={`${avgProgress}%`}
              icon={TrendingUp}
              accent="success"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              label="Bookmarks"
              value={bookmarks.length}
              icon={BookMarked}
              accent="info"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              label="Books finished"
              value={finishedCount}
              icon={Flame}
              accent="warning"
            />
          </StaggerItem>
        </StaggerContainer>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <FadeUp delay={0.1} className="lg:col-span-3">
          <Card className="border-border/60 h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                  </div>
                  Continue reading
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Pick up exactly where you left off
                </p>
              </div>
            </CardHeader>
            <CardContent>
              {recentProgress.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title="No books in progress"
                  description="Start your first book today and build a reading habit."
                  action={
                    <Link href="/books">
                      <Button size="sm">Browse library</Button>
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-2">
                  {recentProgress.map((p) => {
                    const book = p.bookId as unknown as { _id: unknown; title: string; author: string; coverImage?: string; totalChapters?: number };
                    return (
                      <Link
                        key={p._id.toString()}
                        href={`/reader/${book._id}`}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/60 transition-colors group"
                      >
                        <div className="flex h-14 w-10 shrink-0 items-center justify-center rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 border border-border/60">
                          {book.coverImage ? (
                            <img src={book.coverImage} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <BookOpen className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate group-hover:text-primary transition-colors">
                            {book.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Chapter {p.currentChapter}
                            {book.totalChapters ? ` of ${book.totalChapters}` : ""}
                            <span className="text-muted-foreground/50 mx-1.5">·</span>
                            {Math.round(p.percentage)}% complete
                          </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 shrink-0">
                          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary/70 to-primary rounded-full transition-all"
                              style={{ width: `${p.percentage}%` }}
                            />
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </FadeUp>

        <FadeUp delay={0.15} className="lg:col-span-2">
          <Card className="border-border/60 h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-info/10">
                    <BookMarked className="h-3.5 w-3.5 text-info" />
                  </div>
                  Recent bookmarks
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Your saved highlights
                </p>
              </div>
              {bookmarks.length > 0 && (
                <Link href="/dashboard/bookmarks">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    View all <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              )}
            </CardHeader>
            <CardContent>
              {bookmarks.length === 0 ? (
                <EmptyState
                  icon={BookMarked}
                  title="No bookmarks yet"
                  description="Start reading to save highlights and quotes."
                  className="py-10"
                />
              ) : (
                <div className="space-y-3.5">
                  {bookmarks.map((b) => {
                    const book = b.bookId as unknown as { title?: string } | null;
                    return (
                      <Link
                        key={b._id.toString()}
                        href={`/reader/${(b as { bookId: unknown }).bookId}`}
                        className="block group p-2.5 -mx-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex gap-2.5">
                          <Quote className="h-4 w-4 text-primary/40 shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm leading-relaxed text-foreground/90 line-clamp-3 group-hover:text-foreground transition-colors">
                              &ldquo;{b.text.slice(0, 100)}{b.text.length > 100 ? "…" : ""}&rdquo;
                            </p>
                            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                              <span className="font-medium text-foreground">{book?.title || "Unknown"}</span>
                              <span>·</span>
                              <span>Ch {b.chapterNumber}</span>
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </FadeUp>
      </div>
    </div>
  );
}
