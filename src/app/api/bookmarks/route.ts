import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Bookmark from "@/models/Bookmark";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get("bookId");

    await dbConnect();

    const query: Record<string, any> = { userId: session.user.id };
    if (bookId) query.bookId = bookId;

    const bookmarks = await Bookmark.find(query)
      .sort({ createdAt: -1 })
      .populate("bookId", "title author")
      .lean();

    return NextResponse.json(bookmarks);
  } catch {
    return NextResponse.json({ error: "Failed to fetch bookmarks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookId, chapterNumber, text, note } = await req.json();
    await dbConnect();

    const bookmark = await Bookmark.create({
      userId: session.user.id,
      bookId,
      chapterNumber,
      text,
      note,
    });

    return NextResponse.json(bookmark, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create bookmark" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    await dbConnect();

    const bookmark = await Bookmark.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });

    if (!bookmark) {
      return NextResponse.json({ error: "Bookmark not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Bookmark deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete bookmark" }, { status: 500 });
  }
}
