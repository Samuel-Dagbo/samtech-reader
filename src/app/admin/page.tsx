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
import { BookOpen, Users, BookMarked, Layers, Plus, ArrowRight } from "lucide-react";

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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your reading platform</p>
        </div>
        <Link href="/admin/books/new">
          <Button className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" /> Upload Book
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { title: "Total Books", value: totalBooks, icon: BookOpen, gradient: "from-blue-500/20 to-blue-500/5" },
          { title: "Total Users", value: totalUsers, icon: Users, gradient: "from-green-500/20 to-green-500/5" },
          { title: "Active Reads", value: totalReads, icon: BookMarked, gradient: "from-purple-500/20 to-purple-500/5" },
          { title: "Total Chapters", value: totalChapters, icon: Layers, gradient: "from-orange-500/20 to-orange-500/5" },
        ].map((stat) => (
          <Card key={stat.title} className="border-border/60 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Books */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Books</CardTitle>
          <Link href="/admin/books">
            <Button variant="ghost" size="sm" className="gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentBooks.length === 0 ? (
            <div className="empty-state py-8">
              <BookOpen />
              <p className="text-base font-medium text-foreground/60">No books uploaded yet</p>
              <Link href="/admin/books/new">
                <Button variant="outline" size="sm" className="mt-4">Upload your first book</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentBooks.map((book) => (
                <div key={book._id.toString()} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-all group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate group-hover:text-primary transition-colors">{book.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{book.author} &middot; {book.totalChapters} chapters</p>
                    </div>
                  </div>
                  <Link href={`/admin/books/${book._id}/edit`}>
                    <Button variant="ghost" size="sm" className="shrink-0">Edit</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
