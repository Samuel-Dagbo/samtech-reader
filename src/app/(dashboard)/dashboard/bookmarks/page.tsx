import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Bookmark from "@/models/Bookmark";
import { Card, CardContent } from "@/components/ui/card";
import { SectionLabel } from "@/components/ui/section";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookMarked, ArrowRight, Quote, BookOpen, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "My Bookmarks - SamTech Reader",
  description: "View and manage your saved bookmarks across all your books.",
};

export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await dbConnect();

  const bookmarks = await Bookmark.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .populate("bookId", "title author coverImage")
    .lean();

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <FadeUp>
        <div className="pb-8 border-b border-border/60 mb-10">
          <SectionLabel>Your collection</SectionLabel>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl font-semibold tracking-tight">
            My bookmarks
          </h1>
          <p className="mt-2 text-muted-foreground">
            {bookmarks.length > 0
              ? `${bookmarks.length} saved ${bookmarks.length === 1 ? "highlight" : "highlights"} across your library`
              : "Save highlights and quotes as you read"}
          </p>
        </div>
      </FadeUp>

      {bookmarks.length === 0 ? (
        <FadeUp delay={0.1}>
          <EmptyState
            icon={BookMarked}
            title="No bookmarks yet"
            description="Start reading to save your favorite passages and quotes."
            action={
              <Link href="/books">
                <Button size="sm" className="gap-2">
                  <BookOpen className="h-4 w-4" /> Browse library
                </Button>
              </Link>
            }
          />
        </FadeUp>
      ) : (
        <StaggerContainer className="space-y-3.5">
          {bookmarks.map((b) => {
            const book = b.bookId as unknown as { _id: unknown; title?: string; author?: string; coverImage?: string } | null;
            return (
              <StaggerItem key={b._id.toString()}>
                <Card className="border-border/60 hover-lift">
                  <CardContent className="p-5">
                    <Link
                      href={`/reader/${book?._id || (b as { bookId: unknown }).bookId}`}
                      className="block group"
                    >
                      <div className="flex gap-4">
                        {book?.coverImage && (
                          <img
                            src={book.coverImage}
                            alt=""
                            className="h-24 w-16 object-cover rounded-lg shrink-0 hidden sm:block shadow-sm"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <Quote className="h-5 w-5 text-primary/30 mb-2" />
                          <p className="text-[15px] leading-relaxed text-foreground/90 group-hover:text-foreground transition-colors">
                            &ldquo;{b.text}&rdquo;
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">
                              {book?.title || "Unknown book"}
                            </span>
                            {book?.author && (
                              <>
                                <span>·</span>
                                <span>{book.author}</span>
                              </>
                            )}
                            <span>·</span>
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Chapter {b.chapterNumber}
                            </span>
                            <ArrowRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}
    </div>
  );
}
