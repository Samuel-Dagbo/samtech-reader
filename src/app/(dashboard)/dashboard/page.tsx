import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import ReadingProgress from "@/models/ReadingProgress";
import Bookmark from "@/models/Bookmark";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, BookMarked, Clock, TrendingUp, ArrowRight } from "lucide-react";

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

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {session.user.name}</h1>
          <p className="text-muted-foreground mt-1">Your reading dashboard</p>
        </div>
        <Link href="/books">
          <Button variant="outline" className="gap-2 shadow-sm">
            <BookOpen className="h-4 w-4" /> Browse Books <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>

      {/* Mini stats */}
      {recentProgress.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Books Reading", value: recentProgress.length, icon: BookOpen, color: "from-primary/20 to-primary/5" },
            { label: "Avg Progress", value: `${avgProgress}%`, icon: TrendingUp, color: "from-green-500/20 to-green-500/5" },
            { label: "Bookmarks", value: bookmarks.length, icon: BookMarked, color: "from-purple-500/20 to-purple-500/5" },
            { label: "Total Chapters", value: recentProgress.reduce((s, p) => { const book = p.bookId as unknown as { totalChapters?: number }; return s + (book?.totalChapters || 0); }, 0), icon: Clock, color: "from-orange-500/20 to-orange-500/5" },
          ].map((stat, i) => (
            <div key={i} className={`rounded-xl border bg-gradient-to-br ${stat.color} p-4`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-4 w-4 text-primary" /> Continue Reading
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentProgress.length === 0 ? (
              <div className="empty-state py-8">
                <BookOpen />
                <p className="text-base font-medium text-foreground/60">No books in progress</p>
                <Link href="/books">
                  <Button variant="outline" size="sm" className="mt-4">Browse Books</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {recentProgress.map((p: any) => (
                  <Link
                    key={p._id.toString()}
                    href={`/reader/${p.bookId._id}`}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-all group"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate group-hover:text-primary transition-colors">{p.bookId.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Chapter {p.currentChapter} &middot; {Math.round(p.percentage)}% complete
                      </p>
                    </div>
                    <div className="h-2 w-20 bg-muted rounded-full overflow-hidden shrink-0">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${p.percentage}%` }}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookMarked className="h-4 w-4 text-primary" /> Recent Bookmarks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookmarks.length === 0 ? (
              <div className="empty-state py-8">
                <BookMarked />
                <p className="text-base font-medium text-foreground/60">No bookmarks yet</p>
                <p className="text-sm text-muted-foreground mt-1">Start reading to add bookmarks</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {bookmarks.map((b: any) => (
                  <div key={b._id.toString()} className="group border-b border-border/50 pb-3 last:border-0 last:pb-0">
                    <p className="text-sm leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors">
                      &ldquo;{b.text.slice(0, 80)}&rdquo;
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium">{b.bookId?.title}</span> &middot; Chapter {b.chapterNumber}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
