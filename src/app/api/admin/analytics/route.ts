import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Book from "@/models/Book";
import User from "@/models/User";
import Chapter from "@/models/Chapter";
import ReadingProgress from "@/models/ReadingProgress";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const [totalBooks, totalUsers, totalReads, totalChapters, recentBooks, popularBooks] =
      await Promise.all([
        Book.countDocuments(),
        User.countDocuments(),
        ReadingProgress.countDocuments({ percentage: { $gt: 0 } }),
        Chapter.countDocuments(),
        Book.find().sort({ createdAt: -1 }).limit(5).lean(),
        ReadingProgress.aggregate([
          { $match: { percentage: { $gt: 0 } } },
          { $group: { _id: "$bookId", readCount: { $sum: 1 } } },
          { $sort: { readCount: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "books",
              localField: "_id",
              foreignField: "_id",
              as: "book",
            },
          },
          { $unwind: "$book" },
          { $replaceRoot: { newRoot: "$book" } },
        ]),
      ]);

    return NextResponse.json({
      totalBooks,
      totalUsers,
      totalReads,
      totalChapters,
      recentBooks,
      popularBooks,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
