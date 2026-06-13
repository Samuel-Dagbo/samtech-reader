import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Bookmark from "@/models/Bookmark";
import { Card, CardContent } from "@/components/ui/card";
import { SectionLabel } from "@/components/ui/section";
import { FadeUp } from "@/components/ui/motion";
import Link from "next/link";
import { BookMarked, ArrowRight, Quote } from "lucide-react";

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
        <div className="page-header">
          <SectionLabel>Your collection</SectionLabel>
          <h1 className="mt-3">My bookmarks</h1>
          <p>
            {bookmarks.length > 0
              ? `${bookmarks.length} saved ${bookmarks.length === 1 ? "highlight" : "highlights"} across your library`
              : "Save highlights and quotes as you read"}
          </p>
        </div>
      </FadeUp>

      {bookmarks.length === 0 ? (
        <FadeUp delay={0.1}>
          <Card className="border-dashed">
            <CardContent className="py-16">
              <div className="empty-state">
                <BookMarked className="h-8 w-8" />
                <p className="text-base font-medium text-foreground/60 mt-2">No bookmarks yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start reading to save your favorite passages
                </p>
                <Link href="/books" className="mt-5">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80">
                    Browse library <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </FadeUp>
      ) : (
        <div className="space-y-3.5">
          {bookmarks.map((b, i) => {
            const book = b.bookId as unknown as { _id: unknown; title?: string; author?: string; coverImage?: string } | null;
            return (
              <FadeUp key={b._id.toString()} delay={i * 0.04}>
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
                            className="h-20 w-14 object-cover rounded-md shrink-0 hidden sm:block"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <Quote className="h-5 w-5 text-primary/30 mb-2" />
                          <p className="text-[15px] leading-relaxed text-foreground/90 group-hover:text-foreground transition-colors">
                            &ldquo;{b.text}&rdquo;
                          </p>
                          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
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
                            <span>Chapter {b.chapterNumber}</span>
                            <ArrowRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              </FadeUp>
            );
          })}
        </div>
      )}
    </div>
  );
}
