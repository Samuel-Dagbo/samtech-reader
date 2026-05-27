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
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/books/${book._id}`}>
        <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/50 h-full">
          <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-primary/30" />
              </div>
            )}
            {book.genre && (
              <Badge className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm">
                {book.genre}
              </Badge>
            )}
            {hasProgress && (
              <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm px-3 py-1.5">
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
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
              <User className="h-3 w-3" />
              <span className="line-clamp-1">{book.author}</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
              {book.description}
            </p>
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {book.totalChapters} ch
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {book.readingTime} min
                </span>
              </div>
              {hasProgress && (
                <span className="text-primary font-medium">{Math.round(progress)}%</span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
