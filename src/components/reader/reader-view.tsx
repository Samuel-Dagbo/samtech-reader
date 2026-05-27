"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ReadingProgressBar } from "./reading-progress";
import { FontControls } from "./font-controls";
import { BookmarkButton } from "./bookmark-button";
import {
  ChevronLeft, ChevronRight, List, Search, X,
} from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import { useRouter } from "next/navigation";

interface ChapterData {
  _id: string;
  bookId: string;
  chapterNumber: number;
  title: string;
  content: string;
  wordCount: number;
}

interface BookData {
  _id: string;
  title: string;
  author: string;
  totalChapters: number;
}

interface BookmarkData {
  _id: string;
  chapterNumber: number;
  text: string;
}

interface ReaderViewProps {
  data: {
    book: BookData;
    chapters: ChapterData[];
    progress: {
      currentChapter: number;
      scrollPosition: number;
      percentage: number;
    } | null;
    bookmarks: BookmarkData[];
  };
}

export function ReaderView({ data }: ReaderViewProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(() => {
    if (data.progress) {
      const idx = data.chapters.findIndex((c) => c.chapterNumber === (data.progress!.currentChapter || 1));
      return idx >= 0 ? idx : 0;
    }
    return 0;
  });
  const [fontSize, setFontSize] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("samtech-font-size");
      return saved ? parseInt(saved, 10) : 18;
    }
    return 18;
  });
  const [percentage, setPercentage] = useState(data.progress?.percentage || 0);
  const [showToc, setShowToc] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>(data.bookmarks);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSearchIdx, setCurrentSearchIdx] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialScrollRestored = useRef(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const bookId = data.book._id;
  const chapters = data.chapters;

  // Save font size on change
  useEffect(() => {
    localStorage.setItem("samtech-font-size", String(fontSize));
  }, [fontSize]);

  // Restore saved scroll position after content renders
  useEffect(() => {
    const savedScroll = data.progress?.scrollPosition;
    if (savedScroll && containerRef.current) {
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = savedScroll;
        }
      }, 100);
    }
    initialScrollRestored.current = true;
  }, [data.progress?.scrollPosition]);

  const currentChapter = chapters[currentChapterIndex];
  const totalChapters = chapters.length;

  const saveProgress = useCallback(async (chapterIdx: number, scrollPos: number, pct: number) => {
    if (!session?.user?.id) return;

    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          currentChapter: chapters[chapterIdx]?.chapterNumber || 1,
          scrollPosition: scrollPos,
          percentage: pct,
        }),
      });
    } catch { }
  }, [bookId, chapters, session]);

  // Auto-hide header on scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScrollDirection = () => {
      const currentY = el.scrollTop;
      if (currentY > lastScrollY.current && currentY > 80) {
        setHeaderVisible(false);
      } else {
        setHeaderVisible(true);
      }
      lastScrollY.current = currentY;
    };

    el.addEventListener("scroll", handleScrollDirection);
    return () => el.removeEventListener("scroll", handleScrollDirection);
  }, [currentChapter]);

  // Track scroll for progress + auto-save
  useEffect(() => {
    if (!currentChapter) return;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const maxScroll = scrollHeight - clientHeight;
      const pct = maxScroll > 0 ? Math.round((scrollTop / maxScroll) * 100) : 0;
      setPercentage(pct);

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveProgress(currentChapterIndex, scrollTop, pct);
      }, 2000);
    };

    const el = containerRef.current;
    el?.addEventListener("scroll", handleScroll);
    return () => el?.removeEventListener("scroll", handleScroll);
  }, [currentChapter, currentChapterIndex, saveProgress]);

  // Save on page unload using sendBeacon for reliability
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!containerRef.current || !session?.user?.id) return;
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const maxScroll = scrollHeight - clientHeight;
      const pct = maxScroll > 0 ? Math.round((scrollTop / maxScroll) * 100) : 0;

      const payload = new Blob(
        [JSON.stringify({
          bookId,
          currentChapter: currentChapter?.chapterNumber || 1,
          scrollPosition: scrollTop,
          percentage: pct,
        })],
        { type: "application/json" }
      );
      navigator.sendBeacon("/api/progress", payload);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [currentChapter, currentChapterIndex, session, bookId]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  function goToChapter(index: number) {
    if (index < 0 || index >= totalChapters) return;
    setCurrentChapterIndex(index);
    setShowToc(false);
    if (containerRef.current) containerRef.current.scrollTop = 0;

    // Save progress immediately on chapter switch
    saveProgress(index, 0, 0);
  }

  // Keyboard shortcut for search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === "Escape" && showSearch) {
        setShowSearch(false);
        setSearchQuery("");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showSearch]);

  // Search within current chapter
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !currentChapter) return [];
    const content = currentChapter.content.toLowerCase();
    const query = searchQuery.toLowerCase();
    const indices: number[] = [];
    let pos = 0;
    while ((pos = content.indexOf(query, pos)) !== -1) {
      indices.push(pos);
      pos += 1;
    }
    return indices;
  }, [searchQuery, currentChapter]);

  // Navigate search results
  function navigateSearch(direction: "next" | "prev") {
    if (searchResults.length === 0) return;
    const el = containerRef.current;
    if (!el) return;

    const marks = el.querySelectorAll("mark[data-search-highlight]");
    if (marks.length === 0) return;

    let newIdx: number;
    if (direction === "next") {
      newIdx = (currentSearchIdx + 1) % marks.length;
    } else {
      newIdx = (currentSearchIdx - 1 + marks.length) % marks.length;
    }
    setCurrentSearchIdx(newIdx);

    const mark = marks[newIdx] as HTMLElement;
    mark.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // Highlight search results in content
  function getHighlightedContent(): string {
    if (!currentChapter) return "";
    if (!searchQuery.trim()) {
      return currentChapter.content
        .split("\n\n")
        .map((p) => `<p>${p.trim()}</p>`)
        .join("");
    }

    const paragraphs = currentChapter.content.split("\n\n");
    const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");

    return paragraphs
      .map((p) => {
        const highlighted = p.trim().replace(regex, '<mark data-search-highlight class="bg-yellow-300 dark:bg-yellow-600 text-inherit rounded-sm px-0.5">$1</mark>');
        return `<p>${highlighted}</p>`;
      })
      .join("");
  }

  const overallPct = totalChapters > 0
    ? Math.round(((currentChapterIndex) / totalChapters) * 100 + percentage / totalChapters)
    : 0;

  const isFirst = currentChapterIndex === 0;
  const isLast = currentChapterIndex === totalChapters - 1;

  const currentChapterBookmark = bookmarks.find(
    (b) => b.chapterNumber === currentChapter?.chapterNumber
  );
  const isCurrentChapterBookmarked = !!currentChapterBookmark;

  if (!currentChapter) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <p className="text-muted-foreground">No chapters found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <ReadingProgressBar percentage={overallPct} />

      {/* Top bar */}
      <div
        className={`border-b bg-background/95 backdrop-blur px-3 sm:px-4 py-2 flex items-center justify-between shrink-0 transition-transform duration-300 ${
          headerVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/books")}>
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Back</span>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="hidden sm:block">
            <p className="text-sm font-medium line-clamp-1">{data.book.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {session?.user?.id && (
            <BookmarkButton
              bookId={bookId}
              chapterNumber={currentChapter.chapterNumber}
              selectedText=""
              isBookmarked={isCurrentChapterBookmarked}
              bookmarkId={currentChapterBookmark?._id}
              onToggle={() => {
                if (isCurrentChapterBookmarked) {
                  setBookmarks((prev) =>
                    prev.filter((b) => b.chapterNumber !== currentChapter.chapterNumber)
                  );
                } else {
                  setBookmarks((prev) => [
                    ...prev,
                    { _id: Date.now().toString(), chapterNumber: currentChapter.chapterNumber, text: "Chapter bookmark" },
                  ]);
                }
              }}
            />
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
            setShowSearch(!showSearch);
            if (!showSearch) setTimeout(() => searchInputRef.current?.focus(), 50);
          }}>
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowToc(!showToc)} className="gap-1">
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Chapters</span>
            <span className="text-xs text-muted-foreground">
              ({currentChapterIndex + 1}/{totalChapters})
            </span>
          </Button>
          <FontControls fontSize={fontSize} setFontSize={setFontSize} />
        </div>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="border-b bg-muted/50 px-3 sm:px-4 py-2 flex items-center gap-2 shrink-0">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            ref={searchInputRef}
            placeholder="Search in this chapter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") navigateSearch("next");
              if (e.key === "Escape") {
                setShowSearch(false);
                setSearchQuery("");
              }
            }}
            className="h-8 flex-1"
          />
          {searchQuery && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {searchResults.length > 0
                ? `${currentSearchIdx + 1}/${searchResults.length}`
                : "No results"}
            </span>
          )}
          {searchResults.length > 0 && (
            <>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigateSearch("prev")}>
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigateSearch("next")}>
                <ChevronRight className="h-3 w-3" />
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
            setShowSearch(false);
            setSearchQuery("");
          }}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Table of Contents sidebar */}
        {showToc && (
          <div className="w-64 border-r bg-background shrink-0 overflow-y-auto hidden md:block">
            <div className="p-4">
              <h3 className="font-semibold mb-3">Chapters</h3>
              <div className="space-y-1">
                {chapters.map((ch, i) => (
                  <button
                    key={ch._id}
                    onClick={() => goToChapter(i)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      i === currentChapterIndex
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <span className="text-xs opacity-60 mr-2">{ch.chapterNumber}.</span>
                    {ch.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile chapter drawer */}
        {showToc && (
          <div className="md:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
            <div className="p-4 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Chapters</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowToc(false)}>
                  <ChevronLeft className="h-4 w-4" /> Close
                </Button>
              </div>
              <div className="space-y-1">
                {chapters.map((ch, i) => (
                  <button
                    key={ch._id}
                    onClick={() => goToChapter(i)}
                    className={`w-full text-left px-3 py-3 rounded-md text-sm transition-colors ${
                      i === currentChapterIndex
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted"
                    }`}
                  >
                    <span className="text-xs opacity-60 mr-2">{ch.chapterNumber}.</span>
                    {ch.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reading area */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto outline-none"
          tabIndex={0}
        >
          <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
            <div className="mb-6 sm:mb-8 text-center">
              <h1 className="text-xl sm:text-2xl font-bold">{currentChapter.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Chapter {currentChapter.chapterNumber} of {totalChapters}
              </p>
            </div>

            <div
              className="prose-reading"
              style={{ fontSize: `${fontSize}px` }}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(getHighlightedContent()),
              }}
            />

            {/* Navigation */}
            <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t">
              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  onClick={() => goToChapter(currentChapterIndex - 1)}
                  disabled={isFirst}
                  className="gap-1 sm:gap-2 text-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>

                <span className="text-sm text-muted-foreground">
                  {Math.round(overallPct)}% complete
                </span>

                <Button
                  variant="outline"
                  onClick={() => goToChapter(currentChapterIndex + 1)}
                  disabled={isLast}
                  className="gap-1 sm:gap-2 text-sm"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
