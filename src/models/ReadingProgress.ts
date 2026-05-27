import mongoose from "mongoose";

export interface IReadingProgressDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId;
  currentChapter: number;
  scrollPosition: number;
  percentage: number;
  lastReadAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const readingProgressSchema = new mongoose.Schema<IReadingProgressDocument>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    currentChapter: { type: Number, default: 1 },
    scrollPosition: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    lastReadAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

readingProgressSchema.index({ userId: 1, bookId: 1 }, { unique: true });

export default mongoose.models.ReadingProgress || mongoose.model<IReadingProgressDocument>("ReadingProgress", readingProgressSchema);
