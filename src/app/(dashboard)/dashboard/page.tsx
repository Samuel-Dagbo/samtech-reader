import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import ReadingProgress from "@/models/ReadingProgress";
import Bookmark from "@/models/Bookmark";
import Book from "@/models/Book";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, BookMarked, Clock } from "lucide-react";

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

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome, {session.user.name}</h1>
        <p className="text-muted-foreground mt-1">Your reading dashboard</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Continue Reading
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentProgress.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No books in progress</p>
                <Link href="/books">
                  <Button variant="outline" size="sm" className="mt-4">Browse Books</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentProgress.map((p: any) => (
                  <Link
                    key={p._id.toString()}
                    href={`/reader/${p.bookId._id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{p.bookId.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Chapter {p.currentChapter} &middot; {Math.round(p.percentage)}% complete
                      </p>
                    </div>
                    <div className="h-2 w-24 bg-muted rounded-full overflow-hidden shrink-0">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${p.percentage}%` }}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookMarked className="h-4 w-4 text-primary" /> Recent Bookmarks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookmarks.length === 0 ? (
              <div className="text-center py-8">
                <BookMarked className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No bookmarks yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookmarks.map((b: any) => (
                  <div key={b._id.toString()} className="border-b pb-2 last:border-0">
                    <p className="text-sm font-medium">{b.text.slice(0, 60)}...</p>
                    <p className="text-xs text-muted-foreground">
                      {b.bookId?.title} &middot; Chapter {b.chapterNumber}
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
