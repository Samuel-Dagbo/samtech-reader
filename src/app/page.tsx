import Link from "next/link";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import ReadingProgress from "@/models/ReadingProgress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Cloud, BookMarked, ArrowRight, Sparkles } from "lucide-react";
import { HeroAnimation } from "@/components/hero-animation";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  let continueReading: Record<string, unknown>[] = [];

  if (session?.user?.id) {
    await dbConnect();
    continueReading = await ReadingProgress.find({
      userId: session.user.id,
      percentage: { $gt: 0 },
    })
      .sort({ lastReadAt: -1 })
      .limit(3)
      .populate("bookId", "title author coverImage totalChapters")
      .lean();
  }

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden px-4 py-24 md:py-32 lg:py-40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <HeroAnimation>
          <div className="relative mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm mb-8">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Introducing the next-gen reading experience</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Read Anywhere.
              <br />
              <span className="text-primary">Pick Up Where You Left Off.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              SamTech Reader brings the joy of reading to the cloud. Upload your books,
              read across devices, and never lose your place with auto-saving progress.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              {session?.user ? (
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2 text-base">
                    Go to Dashboard <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link href="/register">
                  <Button size="lg" className="gap-2 text-base">
                    Start Reading Free <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              <Link href="/books">
                <Button size="lg" variant="outline" className="gap-2 text-base">
                  Browse Books <BookOpen className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </HeroAnimation>
      </section>

      {/* Continue Reading section for logged-in users */}
      {continueReading.length > 0 && (
        <section className="border-t bg-muted/30 px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold">Continue Reading</h2>
                <p className="text-muted-foreground mt-1">Pick up where you left off</p>
              </div>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {continueReading.map((item: any) => {
                const book = item.bookId;
                if (!book) return null;
                return (
                  <Link key={item._id.toString()} href={`/reader/${book._id}`}>
                    <Card className="group hover:shadow-md hover:border-primary/50 transition-all">
                      <CardContent className="p-4 flex gap-4">
                        <div className="w-12 h-16 rounded bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0 overflow-hidden">
                          {book.coverImage ? (
                            <img src={book.coverImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <BookOpen className="h-5 w-5 text-primary/30" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                            {book.title}
                          </h3>
                          <p className="text-xs text-muted-foreground">{book.author}</p>
                          <div className="mt-2 space-y-1">
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${Math.round(item.percentage)}%` }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {Math.round(item.percentage)}% complete
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="border-t bg-muted/50 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, i) => (
              <div key={i} className="rounded-xl border bg-card p-6 transition-all hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Reading?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join SamTech Reader and experience reading reimagined for the cloud era.
          </p>
          <Link href="/register">
            <Button size="lg" className="gap-2 text-base">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    icon: <Cloud className="h-6 w-6 text-primary" />,
    title: "Cloud Sync",
    description: "Your books and progress sync across all your devices automatically. Start on your phone, finish on your laptop.",
  },
  {
    icon: <BookMarked className="h-6 w-6 text-primary" />,
    title: "Smart Bookmarks",
    description: "Bookmark important passages, add notes, and never lose your place with auto-saving reading progress.",
  },
  {
    icon: <BookOpen className="h-6 w-6 text-primary" />,
    title: "Auto Chapter Split",
    description: "Upload any PDF and our system automatically splits it into chapters with smart text extraction.",
  },
];
