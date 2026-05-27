"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, User } from "lucide-react";
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
    >
      <Link href={`/books/${book._id}`}>
        <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 h-full">
          <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 relative overflow-hidden">
            {book.coverImage ? (
              <>
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 text-primary/20 mx-auto mb-2" />
                  <p className="text-xs text-primary/20 font-medium">No Cover</p>
                </div>
              </div>
            )}
            {book.genre && (
              <Badge className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm border-0 shadow-sm">
                {book.genre}
              </Badge>
            )}
            {hasProgress && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/70 to-transparent px-3 pt-6 pb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-foreground">{Math.round(progress)}%</span>
                  <span className="text-[10px] text-muted-foreground">{progress >= 100 ? "Finished" : "Reading"}</span>
                </div>
                <div className="h-1.5 bg-background/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary/70 to-primary rounded-full transition-all duration-700"
                    style={{ width: `${Math.round(progress)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
              {book.title}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
              <User className="h-3 w-3 shrink-0" />
              <span className="line-clamp-1">{book.author}</span>
            </div>
            <p className="text-sm text-muted-foreground/70 line-clamp-2 mt-2 leading-relaxed">
              {book.description}
            </p>
            {/* Progress bar — always visible */}
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <BookOpen className="h-3 w-3" />
                  <span>{book.totalChapters} chapters</span>
                  <span className="mx-1.5">&middot;</span>
                  <Clock className="h-3 w-3" />
                  <span>{book.readingTime} min</span>
                </div>
                <span className={`text-xs font-medium ${hasProgress ? "text-primary" : "text-muted-foreground/50"}`}>
                  {hasProgress ? `${Math.round(progress)}%` : "Not started"}
                </span>
              </div>
              <div className="h-1.5 bg-muted/60 rounded-full overflow-hidden">
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
