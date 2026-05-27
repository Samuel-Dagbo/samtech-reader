"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen, Clock, User, ArrowRight, ChevronLeft, Layers, Play,
} from "lucide-react";
import { motion } from "framer-motion";

interface ChapterInfo {
  _id: string;
  chapterNumber: number;
  title: string;
  wordCount: number;
}

interface BookDetailData {
  book: {
    _id: string;
    title: string;
    description: string;
    author: string;
    coverImage: string;
    genre?: string;
    tags?: string;
    totalChapters: number;
    readingTime: number;
    createdAt: string;
  };
  chapters: ChapterInfo[];
  progress: {
    currentChapter: number;
    percentage: number;
  } | null;
}

export function BookDetailClient({ data, isLoggedIn }: { data: BookDetailData; isLoggedIn: boolean }) {
  const { book, chapters, progress } = data;
  const hasStarted = progress && progress.percentage > 0;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back button */}
      <Link href="/books" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ChevronLeft className="h-4 w-4" />
        Back to Browse
      </Link>

      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        {/* Book cover */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 border">
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="h-24 w-24 text-primary/20" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Book info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-6"
        >
          <div>
            {book.genre && <Badge className="mb-3">{book.genre}</Badge>}
            <h1 className="text-3xl sm:text-4xl font-bold">{book.title}</h1>
            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="text-lg">{book.author}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              {book.totalChapters} chapters
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {book.readingTime} min read
            </span>
            <span className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {chapters.reduce((acc, ch) => acc + ch.wordCount, 0).toLocaleString()} words
            </span>
          </div>

          <p className="text-muted-foreground leading-relaxed">{book.description}</p>

          {book.tags && (
            <div className="flex flex-wrap gap-2">
              {book.tags.split(",").map((tag) => (
                <Badge key={tag.trim()} variant="outline">{tag.trim()}</Badge>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {isLoggedIn ? (
              <Link href={`/reader/${book._id}`}>
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  {hasStarted ? (
                    <>
                      <Play className="h-4 w-4" />
                      Continue Reading ({Math.round(progress!.percentage)}%)
                    </>
                  ) : (
                    <>
                      <BookOpen className="h-4 w-4" />
                      Start Reading
                    </>
                  )}
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  Sign in to Read
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>

          {hasStarted && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reading progress</span>
                <span className="font-medium">{Math.round(progress!.percentage)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progress!.percentage}%` }}
                />
              </div>
            </div>
          )}

          <Separator />

          {/* Chapter list */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Chapters</h2>
            <div className="space-y-1">
              {chapters.map((ch) => (
                <Link
                  key={ch._id}
                  href={`/reader/${book._id}`}
                  className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-muted transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-6">{ch.chapterNumber}.</span>
                    <span className="font-medium group-hover:text-primary transition-colors">
                      {ch.title}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {ch.wordCount.toLocaleString()} words
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
