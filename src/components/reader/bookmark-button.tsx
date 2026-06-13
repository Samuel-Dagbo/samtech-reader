"use client";

import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface BookmarkButtonProps {
  bookId: string;
  chapterNumber: number;
  selectedText: string;
  isBookmarked: boolean;
  bookmarkId?: string;
  onToggle: () => void;
}

export function BookmarkButton({
  bookId,
  chapterNumber,
  selectedText,
  isBookmarked,
  bookmarkId,
  onToggle,
}: BookmarkButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    try {
      if (isBookmarked && bookmarkId) {
        const res = await fetch("/api/bookmarks", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: bookmarkId }),
        });
        if (res.ok) {
          onToggle();
          toast.success("Bookmark removed");
        }
      } else {
        const res = await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookId, chapterNumber, text: selectedText || "Bookmarked section" }),
        });
        if (res.ok) {
          onToggle();
          toast.success("Bookmarked!");
        }
      }
    } catch {
      toast.error("Failed to update bookmark");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        "h-8 w-8 rounded-lg transition-colors",
        isBookmarked && "text-primary hover:text-primary"
      )}
      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      {isBookmarked ? (
        <BookmarkCheck className="h-4 w-4 fill-primary" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
    </Button>
  );
}
