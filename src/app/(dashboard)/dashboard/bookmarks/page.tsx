import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Bookmark from "@/models/Bookmark";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { BookMarked } from "lucide-react";

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
    .populate("bookId", "title")
    .lean();

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">My Bookmarks</h1>

      {bookmarks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <BookMarked className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No bookmarks yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((b: any) => (
            <Card key={b._id.toString()}>
              <CardContent className="pt-6">
                <Link href={`/reader/${b.bookId?._id || b.bookId}`} className="hover:text-primary transition-colors">
                  <p className="font-medium">&ldquo;{b.text.slice(0, 100)}&rdquo;</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {b.bookId?.title || "Unknown book"} &middot; Chapter {b.chapterNumber}
                  </p>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
