import type { User as NextAuthUser } from "next-auth";

export interface IUser extends NextAuthUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  image?: string;
}

export interface IBook {
  _id: string;
  title: string;
  description: string;
  author: string;
  coverImage: string;
  pdfUrl: string;
  genre?: string;
  tags?: string;
  totalChapters: number;
  totalPages: number;
  readingTime: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChapter {
  _id: string;
  bookId: string;
  chapterNumber: number;
  title: string;
  content: string;
  wordCount: number;
}

export interface IReadingProgress {
  _id: string;
  userId: string;
  bookId: string;
  currentChapter: number;
  scrollPosition: number;
  percentage: number;
  lastReadAt: Date;
}

export interface IBookmark {
  _id: string;
  userId: string;
  bookId: string;
  chapterNumber: number;
  text: string;
  note?: string;
  createdAt: Date;
}

export interface AnalyticsData {
  totalBooks: number;
  totalUsers: number;
  totalReads: number;
  totalChapters: number;
  recentBooks: IBook[];
  popularBooks: IBook[];
}
