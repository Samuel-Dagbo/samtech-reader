import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Book from "@/models/Book";
import User from "@/models/User";
import Chapter from "@/models/Chapter";
import ReadingProgress from "@/models/ReadingProgress";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { SectionLabel } from "@/components/ui/section";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { BookOpen, Users, BookMarked, Layers, Plus, ArrowRight, Upload, Activity, UserPlus, BookOpenCheck } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDistanceToNow } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin Dashboard - SamTech Reader",
  description: "Manage your reading platform. Upload books, view analytics, and manage users.",
};

export const dynamic = "force-dynamic";

function timeAgo(date: Date | string): string {
  try {
    return formatDistanceToNow(new Date(date));
  } catch {
    return "";
  }
}

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/");

  await dbConnect();

  const [totalBooks, totalUsers, totalReads, totalChapters, recentBooks, recentSignups, recentReads] =
    await Promise.all([
      Book.countDocuments(),
      User.countDocuments(),
      ReadingProgress.countDocuments({ percentage: { $gt: 0 } }),
      Chapter.countDocuments(),
      Book.find().sort({ createdAt: -1 }).limit(5).lean(),
      User.find().sort({ createdAt: -1 }).limit(5).select("name email role createdAt").lean(),
      ReadingProgress.find({ percentage: { $gt: 0 } })
        .sort({ lastReadAt: -1 })
        .limit(5)
        .populate("bookId", "title")
        .populate("userId", "name email")
        .lean(),
    ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <FadeUp>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <SectionLabel>Admin panel</SectionLabel>
            <h1 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-balance">
              Dashboard
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage your reading platform at a glance
            </p>
          </div>
          <Link href="/admin/books/new">
            <Button className="gap-2 shadow-lg shadow-primary/25">
              <Plus className="h-4 w-4" /> Upload book
            </Button>
          </Link>
        </div>
      </FadeUp>

      <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <StaggerItem>
          <StatCard
            label="Total books"
            value={totalBooks}
            icon={BookOpen}
            accent="primary"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Total users"
            value={totalUsers}
            icon={Users}
            accent="success"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Active reads"
            value={totalReads}
            icon={BookMarked}
            accent="info"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Chapters"
            value={totalChapters}
            icon={Layers}
            accent="warning"
          />
        </StaggerItem>
      </StaggerContainer>

      <div className="grid gap-6 lg:grid-cols-5 mb-6">
        <FadeUp delay={0.1} className="lg:col-span-3">
          <Card className="border-border/60 h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                    <Activity className="h-3.5 w-3.5 text-primary" />
                  </div>
                  Recent activity
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Latest signups, uploads, and reading activity
                </p>
              </div>
              <Link href="/admin/analytics">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                  View analytics <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <ActivityFeed
                signups={recentSignups.map((u) => ({
                  _id: String(u._id),
                  name: u.name,
                  email: u.email,
                  role: (u as { role?: string }).role || "user",
                  createdAt:
                    u.createdAt instanceof Date
                      ? u.createdAt.toISOString()
                      : String(u.createdAt),
                }))}
                books={recentBooks.map((b) => ({
                  _id: String(b._id),
                  title: b.title,
                  author: b.author,
                  coverImage: b.coverImage || "",
                  createdAt:
                    b.createdAt instanceof Date
                      ? b.createdAt.toISOString()
                      : String(b.createdAt),
                }))}
                reads={recentReads.map((r) => {
                  const book = r.bookId as unknown as { _id: unknown; title?: string } | null;
                  const user = r.userId as unknown as { _id: unknown; name?: string; email?: string } | null;
                  return {
                    _id: String(r._id),
                    bookTitle: book?.title || "Unknown book",
                    bookId: book?._id ? String(book._id) : null,
                    userName: user?.name || "Unknown",
                    userEmail: user?.email || "",
                    percentage: r.percentage || 0,
                    lastReadAt:
                      r.lastReadAt instanceof Date
                        ? r.lastReadAt.toISOString()
                        : String(r.lastReadAt || r.updatedAt || new Date().toISOString()),
                  };
                })}
              />
            </CardContent>
          </Card>
        </FadeUp>

        <FadeUp delay={0.15} className="lg:col-span-2">
          <Card className="border-border/60 h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                    <BookOpen className="h-3.5 w-3.5 text-primary" />
                  </div>
                  Recently uploaded
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Your latest additions to the library
                </p>
              </div>
              <Link href="/admin/books">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                  View all <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentBooks.length === 0 ? (
                <EmptyState
                  icon={Upload}
                  title="No books yet"
                  description="Upload your first book to get started."
                  action={
                    <Link href="/admin/books/new">
                      <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" /> Upload book
                      </Button>
                    </Link>
                  }
                  className="py-12"
                />
              ) : (
                <div className="space-y-2">
                  {recentBooks.map((book) => (
                    <div
                      key={book._id.toString()}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/60 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-14 w-10 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-border/60">
                          {book.coverImage ? (
                            <img
                              src={book.coverImage}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <BookOpen className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate group-hover:text-primary transition-colors">
                            {book.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {book.author}
                            <span className="mx-1.5 opacity-50">·</span>
                            {book.totalChapters} chapters
                          </p>
                        </div>
                      </div>
                      <Link href={`/admin/books/${book._id}/edit`}>
                        <Button variant="ghost" size="sm" className="shrink-0 gap-1.5">
                          Edit <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </FadeUp>
      </div>
    </div>
  );
}

function ActivityFeed({
  signups,
  books,
  reads,
}: {
  signups: { _id: string; name: string; email: string; role: string; createdAt: string }[];
  books: { _id: string; title: string; author: string; coverImage: string; createdAt: string }[];
  reads: {
    _id: string;
    bookTitle: string;
    bookId: string | null;
    userName: string;
    userEmail: string;
    percentage: number;
    lastReadAt: string;
  }[];
}) {
  type FeedItem =
    | { kind: "signup"; _id: string; date: string; data: (typeof signups)[number] }
    | { kind: "upload"; _id: string; date: string; data: (typeof books)[number] }
    | { kind: "read"; _id: string; date: string; data: (typeof reads)[number] };

  const items: FeedItem[] = [
    ...signups.map((s) => ({
      kind: "signup" as const,
      _id: `s-${s._id}`,
      date: s.createdAt,
      data: s,
    })),
    ...books.map((b) => ({
      kind: "upload" as const,
      _id: `b-${b._id}`,
      date: b.createdAt,
      data: b,
    })),
    ...reads.map((r) => ({
      kind: "read" as const,
      _id: `r-${r._id}`,
      date: r.lastReadAt,
      data: r,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="No activity yet"
        description="Signups, uploads, and reading activity will appear here."
        className="py-10"
      />
    );
  }

  return (
    <div className="space-y-1">
      {items.map((item) => {
        const ago = timeAgo(item.date);
        if (item.kind === "signup") {
          return (
            <div
              key={item._id}
              className="flex items-start gap-3 p-2.5 -mx-2.5 rounded-lg hover:bg-muted/40 transition-colors"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
                <UserPlus className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-medium">{item.data.name}</span> signed up
                  {item.data.role === "admin" && (
                    <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                      Admin
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground truncate">{item.data.email}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0 tabular-nums">{ago}</span>
            </div>
          );
        }
        if (item.kind === "upload") {
          return (
            <div
              key={item._id}
              className="flex items-start gap-3 p-2.5 -mx-2.5 rounded-lg hover:bg-muted/40 transition-colors"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpenCheck className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  New book uploaded:{" "}
                  <Link
                    href={`/admin/books/${item.data._id}/edit`}
                    className="font-medium hover:text-primary transition-colors"
                  >
                    {item.data.title}
                  </Link>
                </p>
                <p className="text-xs text-muted-foreground truncate">by {item.data.author}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0 tabular-nums">{ago}</span>
            </div>
          );
        }
        return (
          <div
            key={item._id}
            className="flex items-start gap-3 p-2.5 -mx-2.5 rounded-lg hover:bg-muted/40 transition-colors"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info">
              <BookMarked className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm">
                <span className="font-medium">{item.data.userName}</span> read{" "}
                <span className="font-medium">{item.data.bookTitle}</span>
                <span className="text-muted-foreground">
                  {" "}
                  · {Math.round(item.data.percentage)}%
                </span>
              </p>
              <p className="text-xs text-muted-foreground truncate">{item.data.userEmail}</p>
            </div>
            <span className="text-xs text-muted-foreground shrink-0 tabular-nums">{ago}</span>
          </div>
        );
      })}
    </div>
  );
}
