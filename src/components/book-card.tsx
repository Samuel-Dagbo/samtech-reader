"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, User, Play } from "lucide-react";
import { motion } from "framer-motion";

interface BookCardProps {
  book: {
    _id: string;
    title: string;
    author: string;
    coverImage?: string;
    genre?: string;
    totalChapters: number;
    readingTime: number;
    description: string;
    readingProgress?: number;
  };
  index?: number;
}

export function BookCard({ book, index = 0 }: BookCardProps) {
  const progress = book.readingProgress || 0;
  const hasProgress = progress > 0 && progress < 100;
  const isFinished = progress >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <Link href={`/books/${book._id}`} className="block h-full group">
        <Card className="overflow-hidden h-full flex flex-col hover-lift bento-card border-border/60">
          <div className="bento-card-shine" />
          <div className="relative aspect-[3/4] bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 overflow-hidden shrink-0">
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-background">
                <div className="text-center">
                  <BookOpen className="h-14 w-14 text-primary/20 mx-auto mb-2" />
                  <p className="text-xs text-primary/30 font-medium">No cover</p>
                </div>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {book.genre && (
              <Badge
                variant="glass"
                className="absolute top-3 left-3 text-[11px] font-medium backdrop-blur-md"
              >
                {book.genre}
              </Badge>
            )}

            {(hasProgress || isFinished) && (
              <div className="absolute top-3 right-3">
                <div className="flex items-center gap-1.5 rounded-full bg-background/90 backdrop-blur-md border border-border/60 pl-1 pr-2.5 py-1 shadow-sm">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                  </span>
                  <span className="text-[10px] font-semibold text-foreground">
                    {isFinished ? "Finished" : `${Math.round(progress)}%`}
                  </span>
                </div>
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <div className="flex items-center justify-center gap-1.5 rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-semibold shadow-lg shadow-primary/30">
                <Play className="h-3.5 w-3.5 fill-current" />
                {hasProgress ? "Continue" : "Read now"}
              </div>
            </div>
          </div>

          <CardContent className="p-5 flex flex-col gap-3 flex-1">
            <div className="space-y-1.5 min-h-0">
              <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">
                {book.title}
              </h3>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <User className="h-3 w-3 shrink-0" />
                <span className="line-clamp-1">{book.author}</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed flex-1">
              {book.description}
            </p>

            <div className="mt-auto pt-3.5 border-t border-border/60 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {book.totalChapters}
                  </span>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {book.readingTime}m
                  </span>
                </div>
              </div>
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isFinished
                      ? "bg-success"
                      : hasProgress
                      ? "bg-gradient-to-r from-primary/70 to-primary"
                      : "bg-muted-foreground/20"
                  }`}
                  style={{ width: `${Math.min(100, Math.round(progress))}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
