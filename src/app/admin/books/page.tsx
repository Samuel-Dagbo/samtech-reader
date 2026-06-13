import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Book from "@/models/Book";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionLabel } from "@/components/ui/section";
import { FadeUp } from "@/components/ui/motion";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus, Pencil, BookOpen, Library, Search } from "lucide-react";
import { DeleteBookButton } from "./delete-button";
import { Input } from "@/components/ui/input";

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
            <h1 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
              All books
            </h1>
            <p className="mt-2 text-muted-foreground">
              {books.length} {books.length === 1 ? "book" : "books"} in your library
            </p>
          </div>
          <Link href="/admin/books/new">
            <Button className="gap-2 shadow-lg shadow-primary/25">
              <Plus className="h-4 w-4" /> Add book
            </Button>
          </Link>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <Library className="h-3.5 w-3.5 text-primary" />
              </div>
              Library catalog
            </CardTitle>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search..." className="h-8 pl-9 w-48 text-xs" />
            </div>
          </CardHeader>
          <CardContent>
            {books.length === 0 ? (
              <EmptyState
                icon={BookOpen}
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
              <div className="divide-y divide-border/60">
                {books.map((book) => (
                  <div
                    key={book._id.toString()}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-16 w-11 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-border/60">
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
