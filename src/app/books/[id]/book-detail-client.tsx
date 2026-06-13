"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen, Clock, User, ArrowRight, ChevronLeft, Layers, Play, BookMarked, Hash, Star, Heart, Share2,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

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
  const isFinished = progress && progress.percentage >= 100;
  const totalWords = chapters.reduce((acc, ch) => acc + ch.wordCount, 0);
  const [favorited, setFavorited] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link
          href="/books"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to library
        </Link>
      </motion.div>

      <div className="grid gap-10 lg:gap-14 md:grid-cols-[360px_1fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="md:sticky md:top-24 self-start"
        >
          <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 border border-border/60 shadow-2xl shadow-black/10 dark:shadow-black/40 relative group">
            {book.coverImage ? (
              <>
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <BookOpen className="h-20 w-20 text-primary/15 mx-auto mb-3" />
                  <p className="text-sm text-primary/20 font-medium">No cover image</p>
                </div>
              </div>
            )}
            {book.genre && (
              <Badge
                variant="glass"
                className="absolute top-4 left-4 backdrop-blur-md text-xs font-medium"
              >
                {book.genre}
              </Badge>
            )}
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => {
                setFavorited(!favorited);
                toast.success(favorited ? "Removed from favorites" : "Added to favorites");
              }}
              className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl border border-border/60 bg-card hover:bg-accent/50 hover:border-primary/30 transition-all text-sm font-medium"
            >
              <Heart className={`h-4 w-4 transition-colors ${favorited ? "fill-red-500 text-red-500" : ""}`} />
              {favorited ? "Favorited" : "Favorite"}
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: book.title, text: book.description });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copied");
                }
              }}
              className="h-10 w-10 flex items-center justify-center rounded-xl border border-border/60 bg-card hover:bg-accent/50 hover:border-primary/30 transition-all"
              aria-label="Share"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-7"
        >
          <div>
            {book.genre && (
              <Badge variant="soft" className="mb-3">
                {book.genre}
              </Badge>
            )}
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.05] text-balance">
              {book.title}
            </h1>
            <div className="flex items-center gap-2 mt-3 text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="text-base">by {book.author}</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">4.9 (2,400 reviews)</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Layers, label: "Chapters", value: book.totalChapters },
              { icon: Clock, label: "Read time", value: `${book.readingTime}m` },
              { icon: Hash, label: "Words", value: totalWords > 1000 ? `${(totalWords / 1000).toFixed(1)}k` : totalWords },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border/60 bg-card/60 p-3.5 text-center hover:border-primary/30 hover:bg-accent/30 transition-all"
              >
                <stat.icon className="h-4 w-4 mx-auto text-primary mb-1.5" />
                <div className="font-semibold text-sm">{stat.value}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <p className="text-muted-foreground leading-relaxed text-[15px]">
            {book.description}
          </p>

          {book.tags && (
            <div className="flex flex-wrap gap-1.5">
              {book.tags.split(",").map((tag) => (
                <Badge
                  key={tag.trim()}
                  variant="outline"
                  className="text-xs font-normal"
                >
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {isLoggedIn ? (
              <Link href={`/reader/${book._id}`} className="w-full sm:w-auto">
                <Button
                  size="xl"
                  className="w-full gap-2 shadow-xl shadow-primary/30"
                >
                  {isFinished ? (
                    <>
                      <BookOpen className="h-4 w-4" />
                      Read again
                    </>
                  ) : hasStarted ? (
                    <>
                      <Play className="h-4 w-4 fill-current" />
                      Continue ({Math.round(progress!.percentage)}%)
                    </>
                  ) : (
                    <>
                      <BookOpen className="h-4 w-4" />
                      Start reading
                    </>
                  )}
                </Button>
              </Link>
            ) : (
              <Link href="/login" className="w-full sm:w-auto">
                <Button
                  size="xl"
                  className="w-full gap-2 shadow-xl shadow-primary/30"
                >
                  Sign in to read <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>

          {hasStarted && progress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reading progress</span>
                <span className="font-semibold text-primary">
                  {Math.round(progress.percentage)}%
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full transition-all duration-700"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-border/60">
            <h2 className="font-display text-2xl font-semibold tracking-tight mb-5 flex items-center gap-2">
              <BookMarked className="h-5 w-5 text-primary" />
              Chapters
              <span className="text-sm font-normal text-muted-foreground">
                ({chapters.length})
              </span>
            </h2>
            <Card className="border-border/60">
              <CardContent className="p-2">
                <div className="max-h-[480px] overflow-y-auto scrollbar-thin">
                  {chapters.map((ch) => (
                    <Link
                      key={ch._id}
                      href={`/reader/${book._id}`}
                      className="flex items-center justify-between px-3.5 py-3 rounded-lg hover:bg-muted transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-[11px] font-semibold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          {ch.chapterNumber}
                        </span>
                        <span className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
                          {ch.title}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2 font-mono">
                        {ch.wordCount.toLocaleString()} words
                      </span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
