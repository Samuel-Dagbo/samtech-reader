import mongoose from "mongoose";

export interface IBookDocument extends mongoose.Document {
  title: string;
  description: string;
  author: string;
  coverImage: string;
  pdfUrl: string;
  cloudinaryPdfId: string;
  genre?: string;
  tags?: string;
  totalChapters: number;
  totalPages: number;
  readingTime: number;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bookSchema = new mongoose.Schema<IBookDocument>(
  {
    title: { type: String, required: true, index: true },
    description: { type: String, required: true },
    author: { type: String, required: true },
    coverImage: { type: String, default: "" },
    pdfUrl: { type: String, required: true },
    cloudinaryPdfId: { type: String },
    genre: { type: String },
    tags: { type: String },
    totalChapters: { type: Number, default: 0 },
    totalPages: { type: Number, default: 0 },
    readingTime: { type: Number, default: 0 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.Book || mongoose.model<IBookDocument>("Book", bookSchema);
