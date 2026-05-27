import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

export async function POST() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const presetName = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "samtech_reader_books";

  try {
    await cloudinary.api.update_upload_preset(presetName, {
      max_file_size: 50_000_000, // 50MB
    });
    return NextResponse.json({ success: true, preset: presetName, maxFileSize: 50_000_000 });
  } catch {
    return NextResponse.json(
      { error: `Failed to update preset "${presetName}". Your Cloudinary API key may need additional permissions.` },
      { status: 500 }
    );
  }
}
