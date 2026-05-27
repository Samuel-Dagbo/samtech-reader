import mongoose from "mongoose";

export interface IChapterDocument extends mongoose.Document {
  bookId: mongoose.Types.ObjectId;
  chapterNumber: number;
  title: string;
  content: string;
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const chapterSchema = new mongoose.Schema<IChapterDocument>(
  {
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    chapterNumber: { type: Number, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    wordCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

chapterSchema.index({ bookId: 1, chapterNumber: 1 }, { unique: true });

export default mongoose.models.Chapter || mongoose.model<IChapterDocument>("Chapter", chapterSchema);
