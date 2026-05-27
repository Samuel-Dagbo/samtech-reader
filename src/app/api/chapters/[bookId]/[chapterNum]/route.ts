import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Chapter from "@/models/Chapter";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: Promise<{ bookId: string; chapterNum: string }> }) {
  try {
    const { bookId, chapterNum } = await params;
    await dbConnect();

    const chapter = await Chapter.findOne({ bookId, chapterNumber: parseInt(chapterNum) }).lean();
    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    return NextResponse.json(chapter);
  } catch {
    return NextResponse.json({ error: "Failed to fetch chapter" }, { status: 500 });
  }
}
