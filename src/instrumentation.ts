export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await Promise.all([
      import("@/models/Book"),
      import("@/models/User"),
      import("@/models/ReadingProgress"),
      import("@/models/Bookmark"),
      import("@/models/Chapter"),
    ]);
  }
}
