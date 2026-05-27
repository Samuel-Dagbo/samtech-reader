import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import ReadingProgress from "@/models/ReadingProgress";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get("bookId");

    await dbConnect();

    if (bookId) {
      const progress = await ReadingProgress.findOne({
        userId: session.user.id,
        bookId,
      }).lean();

      if (!progress) {
        return NextResponse.json({
          currentChapter: 1,
          scrollPosition: 0,
          percentage: 0,
        });
      }

      return NextResponse.json(progress);
    }

    const allProgress = await ReadingProgress.find({
      userId: session.user.id,
      percentage: { $gt: 0 },
    })
      .sort({ lastReadAt: -1 })
      .limit(20)
      .populate("bookId", "title author coverImage")
      .lean();

    return NextResponse.json(allProgress);
  } catch {
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookId, currentChapter, scrollPosition, percentage } = await req.json();
    await dbConnect();

    const progress = await ReadingProgress.findOneAndUpdate(
      { userId: session.user.id, bookId },
      { currentChapter, scrollPosition, percentage, lastReadAt: new Date() },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json(progress);
  } catch {
    return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
  }
}
