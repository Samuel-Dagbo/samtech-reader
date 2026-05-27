import mongoose from "mongoose";

export interface IBookmarkDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId;
  chapterNumber: number;
  text: string;
  note?: string;
  createdAt: Date;
}

const bookmarkSchema = new mongoose.Schema<IBookmarkDocument>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    chapterNumber: { type: Number, required: true },
    text: { type: String, required: true },
    note: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Bookmark || mongoose.model<IBookmarkDocument>("Bookmark", bookmarkSchema);
