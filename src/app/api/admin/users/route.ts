import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const users = await User.find()
      .select("name email role image createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const serialized = users.map((u) => ({
      _id: String(u._id),
      name: u.name,
      email: u.email,
      role: u.role,
      image: u.image || "",
      createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : String(u.createdAt),
    }));

    return NextResponse.json({ users: serialized });
  } catch (error) {
    console.error("Admin users GET error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
