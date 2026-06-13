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
import { FadeUp } from "@/components/ui/motion";
import { BookOpen, Users, BookMarked, Layers, Plus, ArrowRight, Upload, Activity } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Dashboard - SamTech Reader",
  description: "Manage your reading platform. Upload books, view analytics, and manage users.",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/");

  await dbConnect();

  const [totalBooks, totalUsers, totalReads, totalChapters, recentBooks] = await Promise.all([
    Book.countDocuments(),
    User.countDocuments(),
    ReadingProgress.countDocuments({ percentage: { $gt: 0 } }),
    Chapter.countDocuments(),
    Book.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <FadeUp>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <SectionLabel>Admin panel</SectionLabel>
            <h1 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
              Dashboard
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage your reading platform at a glance
            </p>
          </div>
          <Link href="/admin/books/new">
            <Button variant="gradient" className="gap-2 shadow-lg shadow-primary/25">
              <Plus className="h-4 w-4" /> Upload book
            </Button>
          </Link>
        </div>
      </FadeUp>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <FadeUp delay={0.05}>
          <StatCard
            label="Total books"
            value={totalBooks}
            icon={BookOpen}
            accent="primary"
          />
        </FadeUp>
        <FadeUp delay={0.1}>
          <StatCard
            label="Total users"
            value={totalUsers}
            icon={Users}
            accent="success"
          />
        </FadeUp>
        <FadeUp delay={0.15}>
          <StatCard
            label="Active reads"
            value={totalReads}
            icon={BookMarked}
            accent="info"
          />
        </FadeUp>
        <FadeUp delay={0.2}>
          <StatCard
            label="Chapters"
            value={totalChapters}
            icon={Layers}
            accent="warning"
          />
        </FadeUp>
      </div>

      <FadeUp delay={0.25}>
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-4 w-4 text-primary" />
                Recently uploaded
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
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
              <div className="empty-state py-12">
                <Upload className="h-7 w-7" />
                <p className="text-base font-medium text-foreground/60">No books yet</p>
                <p className="text-sm text-muted-foreground mt-1">Upload your first book to get started</p>
                <Link href="/admin/books/new" className="mt-5">
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" /> Upload book
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentBooks.map((book) => (
                  <div
                    key={book._id.toString()}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-12 w-9 rounded-md overflow-hidden shrink-0 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
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
                          <span className="mx-1.5 opacity-50">·</span>
                          {book.readingTime}m
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
  );
}
