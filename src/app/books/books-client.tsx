"use client";

import { useState, useRef, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { BookCard } from "@/components/book-card";
import { Search, SlidersHorizontal, X, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Book {
  _id: string;
  title: string;
  description: string;
  author: string;
  coverImage: string;
  genre: string;
  totalChapters: number;
  readingTime: number;
  readingProgress?: number;
}

export function BooksClient({ books }: { books: Book[] }) {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [sort, setSort] = useState<"newest" | "title" | "chapters">("newest");
  const inputRef = useRef<HTMLInputElement>(null);

  const genres = useMemo(
    () => [...new Set(books.map((b) => b.genre).filter(Boolean))],
    [books]
  );

  const filtered = useMemo(() => {
    let list = books.filter((book) => {
      const matchesSearch =
        !search ||
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase());
      const matchesGenre = !genre || book.genre === genre;
      return matchesSearch && matchesGenre;
    });
    if (sort === "title") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "chapters") {
      list = [...list].sort((a, b) => b.totalChapters - a.totalChapters);
    }
    return list;
  }, [books, search, genre, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="page-header"
      >
        <h1>Browse the library</h1>
        <p>Discover your next great read from {books.length} {books.length === 1 ? "book" : "books"}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="mb-10 space-y-5"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search by title or author..."
              className="pl-11 h-12 rounded-xl bg-background/60 border-border/60 focus-visible:bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  inputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "newest" | "title" | "chapters")}
            className="h-12 px-4 rounded-xl border border-border/60 bg-background/60 text-sm font-medium hover:border-primary/30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="newest">Newest first</option>
            <option value="title">Title (A–Z)</option>
            <option value="chapters">Most chapters</option>
          </select>
        </div>

        {genres.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground mr-1" />
            <button
              onClick={() => setGenre("")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all border",
                !genre
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background/60 text-muted-foreground border-border/60 hover:border-primary/30 hover:text-foreground"
              )}
            >
              All
              <span className="ml-1.5 opacity-60">{books.length}</span>
            </button>
            {genres.map((g) => {
              const count = books.filter((b) => b.genre === g).length;
              const active = g === genre;
              return (
                <button
                  key={g}
                  onClick={() => setGenre(active ? "" : g)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all border",
                    active
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background/60 text-muted-foreground border-border/60 hover:border-primary/30 hover:text-foreground"
                  )}
                >
                  {g}
                  <span className="ml-1.5 opacity-60">{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </motion.div>

      {filtered.length === 0 ? (
        <div className="empty-state py-24">
          <BookOpen className="h-8 w-8" />
          <p className="text-base font-medium text-foreground/60 mt-2">No books found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${search}-${genre}-${sort}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6"
          >
            {filtered.map((book, i) => (
              <BookCard key={book._id} book={book} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
