"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, User, ArrowRight } from "lucide-react";
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
  const hasProgress = progress > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <Link href={`/books/${book._id}`} className="block h-full">
        <Card className="group overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-primary/30 hover:-translate-y-1.5 h-full flex flex-col">
          <div className="relative h-[300px] sm:h-[320px] bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 overflow-hidden shrink-0">
            {book.coverImage ? (
              <>
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <BookOpen className="h-16 w-16 text-primary/20 mx-auto mb-3" />
                  <p className="text-sm text-primary/20 font-medium">No Cover</p>
                </div>
              </div>
            )}
            {book.genre && (
              <Badge className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm border-0 shadow-sm text-xs font-medium">
                {book.genre}
              </Badge>
            )}
            {hasProgress && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/70 to-transparent px-4 pt-8 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-foreground">{Math.round(progress)}% complete</span>
                  <span className="text-[11px] text-muted-foreground/80">{progress >= 100 ? "Finished" : "Reading"}</span>
                </div>
                <div className="h-2 bg-background/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary/70 to-primary rounded-full transition-all duration-700"
                    style={{ width: `${Math.round(progress)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <CardContent className="p-5 sm:p-6 flex flex-col gap-3 flex-1">
            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                {book.title}
              </h3>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <User className="h-3.5 w-3.5 shrink-0" />
                <span className="line-clamp-1">{book.author}</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground/70 line-clamp-3 leading-relaxed flex-1">
              {book.description}
            </p>

            {/* Progress bar — always visible */}
            <div className="mt-auto pt-3 border-t border-border/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{book.totalChapters} chapters</span>
                  <span className="text-muted-foreground/40">&middot;</span>
                  <Clock className="h-3.5 w-3.5" />
                  <span>{book.readingTime} min</span>
                </div>
                <span className={`text-xs font-medium ${hasProgress ? "text-primary" : "text-muted-foreground/40"}`}>
                  {hasProgress ? `${Math.round(progress)}%` : "Not started"}
                </span>
              </div>
              <div className="h-2 bg-muted/60 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    hasProgress
                      ? "bg-gradient-to-r from-primary/70 to-primary"
                      : "bg-transparent"
                  }`}
                  style={{ width: hasProgress ? `${Math.round(progress)}%` : "0%" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
