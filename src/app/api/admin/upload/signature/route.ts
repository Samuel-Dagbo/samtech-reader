import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUploadSignature, cloudinaryConfig } from "@/lib/cloudinary";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { signature, timestamp } = getUploadSignature({
      folder: "samtech-reader/pdfs",
    });

    return NextResponse.json({
      signature,
      timestamp,
      apiKey: cloudinaryConfig.apiKey,
      cloudName: cloudinaryConfig.cloudName,
      folder: "samtech-reader/pdfs",
    });
  } catch (error) {
    console.error("Signature generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload signature" },
      { status: 500 }
    );
  }
}
