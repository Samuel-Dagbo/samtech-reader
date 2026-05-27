"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { BookCard } from "@/components/book-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

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

  const genres = [...new Set(books.map((b) => b.genre).filter(Boolean))];

  const filtered = books.filter((book) => {
    const matchesSearch = !search || book.title.toLowerCase().includes(search.toLowerCase()) || book.author.toLowerCase().includes(search.toLowerCase());
    const matchesGenre = !genre || genre === "__all__" || book.genre === genre;
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Books</h1>
        <p className="text-muted-foreground">Discover your next great read</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or author..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {genres.length > 0 && (
          <Select value={genre} onValueChange={setGenre}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="All Genres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Genres</SelectItem>
              {genres.map((g) => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No books found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filtered.map((book, i) => (
            <BookCard key={book._id} book={book} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
