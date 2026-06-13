import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Book from "@/models/Book";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionLabel } from "@/components/ui/section";
import { FadeUp } from "@/components/ui/motion";
import { Plus, Pencil, BookOpen, Library } from "lucide-react";
import { DeleteBookButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function AdminBooksPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/");

  await dbConnect();
  const books = await Book.find().sort({ createdAt: -1 }).lean();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <FadeUp>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <SectionLabel>Library management</SectionLabel>
            <h1 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
              All books
            </h1>
            <p className="mt-2 text-muted-foreground">
              {books.length} {books.length === 1 ? "book" : "books"} in your library
            </p>
          </div>
          <Link href="/admin/books/new">
            <Button variant="gradient" className="gap-2 shadow-lg shadow-primary/25">
              <Plus className="h-4 w-4" /> Add book
            </Button>
          </Link>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Library className="h-4 w-4 text-primary" />
              Library catalog
            </CardTitle>
          </CardHeader>
          <CardContent>
            {books.length === 0 ? (
              <div className="empty-state py-14">
                <BookOpen className="h-7 w-7" />
                <p className="text-base font-medium text-foreground/60">No books yet</p>
                <p className="text-sm text-muted-foreground mt-1">Upload your first book to get started</p>
                <Link href="/admin/books/new" className="mt-5">
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" /> Upload book
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {books.map((book) => (
                  <div
                    key={book._id.toString()}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-14 w-10 rounded-md overflow-hidden shrink-0 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
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
                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                          {book.author}
                          <span className="mx-1.5 opacity-50">·</span>
                          {book.totalChapters} ch
                          <span className="mx-1.5 opacity-50">·</span>
                          {book.readingTime}m
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 sm:shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Link href={`/admin/books/${book._id}/edit`}>
                        <Button variant="ghost" size="sm" className="gap-1.5">
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                      </Link>
                      <DeleteBookButton bookId={book._id.toString()} title={book.title} />
                    </div>
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
