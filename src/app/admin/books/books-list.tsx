"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { DeleteBookButton } from "./delete-button";
import { Plus, Pencil, BookOpen, Library, Search } from "lucide-react";

type BookItem = {
  _id: string;
  title: string;
  author: string;
  coverImage: string;
  totalChapters: number;
  readingTime: number;
};

export function BooksList({ books }: { books: BookItem[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return books;
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q)
    );
  }, [books, search]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            All books
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            {search
              ? `${filtered.length} of ${books.length} ${books.length === 1 ? "book" : "books"}`
              : `${books.length} ${books.length === 1 ? "book" : "books"} in your library`}
          </p>
        </div>
        <Link href="/admin/books/new">
          <Button className="gap-2 shadow-lg shadow-primary/25">
            <Plus className="h-4 w-4" /> Add book
          </Button>
        </Link>
      </div>

      <div className="border border-border/60 rounded-2xl bg-card overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <Library className="h-3.5 w-3.5 text-primary" />
            </div>
            <h2 className="text-base font-semibold">Library catalog</h2>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by title or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9"
            />
          </div>
        </div>
        <div className="p-5">
          {filtered.length === 0 ? (
            books.length === 0 ? (
              <EmptyState
                icon={<BookOpen className="h-7 w-7 text-primary" strokeWidth={1.75} />}
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
              <EmptyState
                icon={<Search className="h-7 w-7 text-primary" strokeWidth={1.75} />}
                title="No matches"
                description={`No books match "${search}".`}
                className="py-10"
              />
            )
          ) : (
            <div className="divide-y divide-border/60 -mx-5">
              {filtered.map((book) => (
                <div
                  key={book._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 first:pt-0 last:pb-0 group"
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
                    <DeleteBookButton bookId={book._id} title={book.title} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
