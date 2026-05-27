import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(
  file: string,
  options: { folder?: string; resource_type?: "image" | "raw" | "auto" } = {}
) {
  return cloudinary.uploader.upload(file, {
    folder: options.folder || "samtech-reader",
    resource_type: options.resource_type || "auto",
  });
}

export async function uploadBufferToCloudinary(
  buffer: Buffer,
  options: { folder?: string; resource_type?: "image" | "raw" | "auto" } = {}
): Promise<{ secure_url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || "samtech-reader",
        resource_type: options.resource_type || "auto",
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Upload failed"));
        } else {
          resolve({ secure_url: result.secure_url, public_id: result.public_id });
        }
      }
    );
    uploadStream.end(buffer);
  });
}

export async function deleteFromCloudinary(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}

export function getUploadSignature(
  params: Record<string, string | number>
): { signature: string; timestamp: number } {
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { ...params, timestamp },
    process.env.CLOUDINARY_API_SECRET!
  );
  return { signature, timestamp };
}

export const cloudinaryConfig = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
  apiKey: process.env.CLOUDINARY_API_KEY!,
};

export default cloudinary;
