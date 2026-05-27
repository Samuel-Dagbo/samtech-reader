"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen, Clock, User, ArrowRight, ChevronLeft, Layers, Play, BookMarked,
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
  const totalWords = chapters.reduce((acc, ch) => acc + ch.wordCount, 0);

  return (
    <div className="mx-auto max-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back button */}
      <Link href="/books" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group">
        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Browse
      </Link>

      <div className="grid gap-10 lg:gap-16 md:grid-cols-[320px_1fr]">
        {/* Book cover */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="md:sticky md:top-24 self-start"
        >
          <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 border shadow-xl relative group">
            {book.coverImage ? (
              <>
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent" />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <BookOpen className="h-20 w-20 text-primary/15 mx-auto mb-3" />
                  <p className="text-sm text-primary/20 font-medium">No Cover Image</p>
                </div>
              </div>
            )}
            {book.genre && (
              <Badge className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm border-0 shadow-sm">
                {book.genre}
              </Badge>
            )}
          </div>
        </motion.div>

        {/* Book info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{book.title}</h1>
            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="text-lg">{book.author}</span>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Layers, label: "Chapters", value: book.totalChapters },
              { icon: Clock, label: "Read time", value: `${book.readingTime} min` },
              { icon: BookOpen, label: "Words", value: totalWords.toLocaleString() },
            ].map((stat, i) => (
              <div key={i} className="rounded-xl border bg-muted/30 p-3 text-center hover:bg-muted/50 transition-colors">
                <stat.icon className="h-4 w-4 mx-auto text-primary mb-1" />
                <div className="text-sm font-semibold">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          <p className="text-muted-foreground leading-relaxed">{book.description}</p>

          {book.tags && (
            <div className="flex flex-wrap gap-2">
              {book.tags.split(",").map((tag) => (
                <Badge key={tag.trim()} variant="outline" className="text-xs font-normal">{tag.trim()}</Badge>
              ))}
            </div>
          )}

          {/* CTA + Progress */}
          <div className="flex flex-col sm:flex-row gap-3">
            {isLoggedIn ? (
              <Link href={`/reader/${book._id}`}>
                <Button size="lg" className="gap-2 w-full sm:w-auto shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
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
                <Button size="lg" className="gap-2 w-full sm:w-auto shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                  Sign in to Read <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>

          {hasStarted && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reading progress</span>
                <span className="font-medium text-primary">{Math.round(progress!.percentage)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full transition-all duration-700"
                  style={{ width: `${progress!.percentage}%` }}
                />
              </div>
            </div>
          )}

          <Separator className="my-2" />

          {/* Chapter list */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BookMarked className="h-5 w-5 text-primary" />
              Chapters
            </h2>
            <div className="space-y-1">
              {chapters.map((ch) => (
                <Link
                  key={ch._id}
                  href={`/reader/${book._id}`}
                  className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-muted transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-xs font-medium text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {ch.chapterNumber}
                    </span>
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
