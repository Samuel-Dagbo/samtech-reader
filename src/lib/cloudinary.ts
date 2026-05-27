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

export async function deleteFromCloudinary(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
