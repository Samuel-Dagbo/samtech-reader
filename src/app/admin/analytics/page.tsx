import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Book from "@/models/Book";
import User from "@/models/User";
import Chapter from "@/models/Chapter";
import ReadingProgress from "@/models/ReadingProgress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { SectionLabel } from "@/components/ui/section";
import { FadeUp } from "@/components/ui/motion";
import { TimelineChart, RankedList } from "@/components/admin/charts";
import { BookOpen, Users, BookMarked, Layers, TrendingUp, UserPlus, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Analytics - SamTech Reader",
  description: "Platform analytics, trends, and insights.",
};

export const dynamic = "force-dynamic";

const DAYS = 30;

function formatDay(date: Date): string {
  return date.toISOString().slice(5, 10);
}

function buildDailySeries(
  buckets: { _id: string; count: number }[],
  days: number
): { label: string; value: number }[] {
  const map = new Map(buckets.map((b) => [b._id, b.count]));
  const result: { label: string; value: number }[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ label: formatDay(d), value: map.get(key) || 0 });
  }
  return result;
}

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/");

  await dbConnect();

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (DAYS - 1));

  const [
    totalBooks,
    totalUsers,
    totalReads,
    totalChapters,
    booksByDay,
    usersByDay,
    readsByDay,
    popularBooks,
  ] = await Promise.all([
    Book.countDocuments(),
    User.countDocuments(),
    ReadingProgress.countDocuments({ percentage: { $gt: 0 } }),
    Chapter.countDocuments(),
    Book.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
    ]),
    User.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
    ]),
    ReadingProgress.aggregate([
      { $match: { lastReadAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$lastReadAt" } },
          count: { $sum: 1 },
        },
      },
    ]),
    ReadingProgress.aggregate([
      { $match: { percentage: { $gt: 0 } } },
      { $group: { _id: "$bookId", reads: { $sum: 1 }, avgPct: { $avg: "$percentage" } } },
      { $sort: { reads: -1 } },
      { $limit: 8 },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "book",
        },
      },
      { $unwind: "$book" },
    ]),
  ]);

  const uploadsSeries = buildDailySeries(booksByDay, DAYS);
  const signupsSeries = buildDailySeries(usersByDay, DAYS);
  const readsSeries = buildDailySeries(readsByDay, DAYS);

  const totalUploadsLast30 = uploadsSeries.reduce((s, d) => s + d.value, 0);
  const totalSignupsLast30 = signupsSeries.reduce((s, d) => s + d.value, 0);
  const totalReadsLast30 = readsSeries.reduce((s, d) => s + d.value, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <FadeUp>
        <div className="mb-10">
          <SectionLabel>Insights</SectionLabel>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-balance">
            Analytics
          </h1>
          <p className="mt-2 text-muted-foreground">
            Last {DAYS} days of platform activity
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.05}>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-10">
          <StatCard label="Total books" value={totalBooks} icon={BookOpen} accent="primary" />
          <StatCard label="Total users" value={totalUsers} icon={Users} accent="success" />
          <StatCard label="Active reads" value={totalReads} icon={BookMarked} accent="info" />
          <StatCard label="Chapters" value={totalChapters} icon={Layers} accent="warning" />
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="grid gap-6 lg:grid-cols-3 mb-6">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                    <BookOpen className="h-3.5 w-3.5 text-primary" />
                  </div>
                  Books uploaded
                </CardTitle>
                <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                  {totalUploadsLast30} total
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <TimelineChart data={uploadsSeries} accent="primary" />
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-success/10">
                    <UserPlus className="h-3.5 w-3.5 text-success" />
                  </div>
                  New signups
                </CardTitle>
                <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                  {totalSignupsLast30} total
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <TimelineChart data={signupsSeries} accent="success" />
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-info/10">
                    <Activity className="h-3.5 w-3.5 text-info" />
                  </div>
                  Reading activity
                </CardTitle>
                <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                  {totalReadsLast30} total
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <TimelineChart data={readsSeries} accent="info" />
            </CardContent>
          </Card>
        </div>
      </FadeUp>

      <div className="grid gap-6 lg:grid-cols-5">
        <FadeUp delay={0.15} className="lg:col-span-3">
          <Card className="border-border/60 h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-warning/10">
                    <TrendingUp className="h-3.5 w-3.5 text-warning" />
                  </div>
                  Most popular books
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Ranked by unique readers
                </p>
              </div>
            </CardHeader>
            <CardContent>
              {popularBooks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-10 text-center">
                  No reading activity yet
                </p>
              ) : (
                <RankedList
                  accent="warning"
                  items={popularBooks.map((p: { book: { title: string; author: string }; reads: number; avgPct: number }) => ({
                    label: p.book.title,
                    sublabel: `${p.book.author} · avg ${Math.round(p.avgPct || 0)}% completion`,
                    value: p.reads,
                  }))}
                />
              )}
            </CardContent>
          </Card>
        </FadeUp>

        <FadeUp delay={0.2} className="lg:col-span-2">
          <Card className="border-border/60 h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                    <BookOpen className="h-3.5 w-3.5 text-primary" />
                  </div>
                  Quick actions
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Manage your platform
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <Link href="/admin/books/new" className="block">
                <Button variant="outline" className="w-full justify-between">
                  Upload a new book
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/admin/books" className="block">
                <Button variant="outline" className="w-full justify-between">
                  Manage library
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/admin/users" className="block">
                <Button variant="outline" className="w-full justify-between">
                  Manage users
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </FadeUp>
      </div>
    </div>
  );
}
