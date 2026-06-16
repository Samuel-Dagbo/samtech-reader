import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import ReadingProgress from "@/models/ReadingProgress";
import Bookmark from "@/models/Bookmark";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "You cannot change your own role" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const role = body?.role;
    if (role !== "admin" && role !== "user") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    await dbConnect();
    const updated = await User.findByIdAndUpdate(
      id,
      { $set: { role } },
      { new: true, select: "name email role image createdAt" }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        _id: String(updated._id),
        name: updated.name,
        email: updated.email,
        role: updated.role,
        image: updated.image || "",
        createdAt:
          updated.createdAt instanceof Date
            ? updated.createdAt.toISOString()
            : String(updated.createdAt),
      },
    });
  } catch (error) {
    console.error("Admin user PATCH error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    await dbConnect();
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await Promise.all([
      ReadingProgress.deleteMany({ userId: id }),
      Bookmark.deleteMany({ userId: id }),
      User.findByIdAndDelete(id),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin user DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
