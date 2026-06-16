import mongoose from "mongoose";

const MONGODB_URI = "mongodb+srv://babysoldier570_db_user:6fDROUKhDZalTeko@cluster0.jkwhdj8.mongodb.net/samtech-reader?appName=Cluster0";

const bookSchema = new mongoose.Schema(
  {
    title: String, author: String, coverImage: String, totalChapters: Number,
  },
  { timestamps: true }
);
const userSchema = new mongoose.Schema(
  { name: String, email: String, password: String, role: String },
  { timestamps: true }
);
const rpSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
    currentChapter: Number, percentage: Number, lastReadAt: Date,
  },
  { timestamps: true }
);
const bmSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
    chapterNumber: Number, text: String, note: String,
  },
  { timestamps: true }
);

const Book = mongoose.models.Book || mongoose.model("Book", bookSchema);
const User = mongoose.models.User || mongoose.model("User", userSchema);
const ReadingProgress = mongoose.models.ReadingProgress || mongoose.model("ReadingProgress", rpSchema);
const Bookmark = mongoose.models.Bookmark || mongoose.model("Bookmark", bmSchema);

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("[ok] connected to mongodb");

  const user = await User.findOne();
  if (!user) {
    console.log("[fail] no users in db");
    return;
  }
  const userId = user._id.toString();
  console.log("[ok] test user:", user.email, "id:", userId);

  console.log("\n[test] ReadingProgress.find with string userId + populate...");
  const rp = await ReadingProgress.find({ userId, percentage: { $gt: 0 } })
    .sort({ lastReadAt: -1 })
    .limit(10)
    .populate("bookId", "title author coverImage totalChapters")
    .lean();
  console.log("[ok] ReadingProgress count:", rp.length);
  if (rp[0]) {
    console.log("[ok] rp[0].bookId populated:", typeof rp[0].bookId, JSON.stringify(rp[0].bookId).slice(0, 120));
  }

  console.log("\n[test] Bookmark.find with string userId + populate...");
  const bm = await Bookmark.find({ userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("bookId", "title")
    .lean();
  console.log("[ok] Bookmark count:", bm.length);
  if (bm[0]) {
    console.log("[ok] bm[0].bookId populated:", typeof bm[0].bookId, JSON.stringify(bm[0].bookId).slice(0, 120));
  }

  console.log("\n[test] Template-literal coercion of populated _id...");
  if (rp[0]) {
    const book = rp[0].bookId;
    const href = `/reader/${book._id}`;
    console.log("[ok] href:", href);
  }

  console.log("\n=== ALL DATA-LAYER TESTS PASSED ===");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("\n=== REAL ERROR ===");
  console.error("name:", err.name);
  console.error("message:", err.message);
  console.error("stack:", err.stack);
  process.exit(1);
});
