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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your reading platform</p>
        </div>
        <Link href="/admin/books/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Upload Book
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { title: "Total Books", value: totalBooks, icon: BookOpen, color: "text-blue-500" },
          { title: "Total Users", value: totalUsers, icon: Users, color: "text-green-500" },
          { title: "Active Reads", value: totalReads, icon: BookMarked, color: "text-purple-500" },
          { title: "Total Chapters", value: totalChapters, icon: Layers, color: "text-orange-500" },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Books</CardTitle>
          <Link href="/admin/books">
            <Button variant="ghost" size="sm" className="gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentBooks.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No books uploaded yet</p>
          ) : (
            <div className="space-y-3">
              {recentBooks.map((book) => (
                <div key={book._id.toString()} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{book.title}</p>
                    <p className="text-sm text-muted-foreground">{book.author} &middot; {book.totalChapters} chapters</p>
                  </div>
                  <Link href={`/admin/books/${book._id}/edit`}>
                    <Button variant="ghost" size="sm">Edit</Button>
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
