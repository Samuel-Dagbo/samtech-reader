"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { BookCard } from "@/components/book-card";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const inputRef = useRef<HTMLInputElement>(null);

  const genres = [...new Set(books.map((b) => b.genre).filter(Boolean))];

  const filtered = books.filter((book) => {
    const matchesSearch = !search || book.title.toLowerCase().includes(search.toLowerCase()) || book.author.toLowerCase().includes(search.toLowerCase());
    const matchesGenre = !genre || book.genre === genre;
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="page-header mb-8">
        <h1>Browse Books</h1>
        <p>Discover your next great read</p>
      </div>

      {/* Search + Filters */}
      <div className="mb-10 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Search by title or author..."
            className="pl-10 h-11 rounded-xl bg-muted/50 border-border/60 focus-visible:bg-background transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => { setSearch(""); inputRef.current?.focus(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {genres.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground mr-1" />
            <button
              onClick={() => setGenre("")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!genre ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              All
            </button>
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setGenre(g === genre ? "" : g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${g === genre ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >
                {g}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="empty-state py-24">
          <Search className="h-8 w-8" />
          <p className="text-base font-medium text-foreground/60 mt-2">No books found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${search}-${genre}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
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
