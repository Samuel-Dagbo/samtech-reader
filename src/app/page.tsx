import Link from "next/link";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import ReadingProgress from "@/models/ReadingProgress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Cloud,
  BookMarked,
  ArrowRight,
  Sparkles,
  Upload,
  Bookmark,
  RefreshCw,
  CheckCircle,
  Layers,
  Zap,
  FileText,
  Heart,
  Library,
} from "lucide-react";
import { HeroAnimation, StaggerFade, FadeUp } from "@/components/hero-animation";

export const dynamic = "force-dynamic";

interface PopulatedBook {
  _id: unknown;
  title: string;
  author: string;
  coverImage?: string;
  totalChapters?: number;
}

interface PopulatedProgress {
  _id: unknown;
  bookId: PopulatedBook;
  percentage: number;
  lastReadAt: Date;
}

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
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden px-4 pt-24 pb-32 md:pt-36 md:pb-48">
        <div className="hero-glow" />
        <div className="mesh-gradient absolute inset-0" />
        <div className="grid-pattern absolute inset-0 opacity-[0.12]" />
        {/* Abstract decorative shapes */}
        <div className="floating-orb w-72 h-72 top-[-5%] left-[-5%] bg-primary/[0.08] animate-pulse-glow" />
        <div className="floating-orb w-96 h-96 bottom-[-10%] right-[-8%] bg-[oklch(0.6_0.18_265)]/6 animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        <div className="hero-decoration w-48 h-48 top-[15%] right-[20%]" />
        <div className="ring-decoration w-64 h-64 top-[10%] right-[12%]" />
        <div className="hero-decoration w-36 h-36 bottom-[20%] left-[10%]" />
        <div className="ring-decoration w-48 h-48 bottom-[25%] left-[6%]" />
        {/* Dot clusters */}
        <div className="absolute top-24 right-[12%] hidden lg:block">
          <div className="grid grid-cols-4 gap-3 opacity-20">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-1.5 w-1.5 rounded-full bg-primary" />
            ))}
          </div>
        </div>
        <div className="absolute bottom-40 left-[5%] hidden lg:block">
          <div className="grid grid-cols-3 gap-2.5 opacity-15">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-1 w-1 rounded-full bg-primary" />
            ))}
          </div>
        </div>
        <HeroAnimation>
          <div className="relative mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/50 px-4 py-1.5 text-sm mb-8 backdrop-blur-xl shadow-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Introducing the next-gen reading experience
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.08]">
              Read Anywhere.{" "}
              <span className="gradient-text">Never Lose Your Page.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              Upload your books once. Read seamlessly across every device.
              Auto-saving tracks every page, every bookmark, every highlight&mdash;so
              you never have to search for where you left off.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              {session?.user ? (
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2 text-base h-12 px-8 rounded-xl shadow-xl shadow-primary/20">
                    Go to Dashboard <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link href="/register">
                  <Button size="lg" className="gap-2 text-base h-12 px-8 rounded-xl shadow-xl shadow-primary/25">
                    Start Reading Free <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              <Link href="/books">
                <Button size="lg" variant="outline" className="gap-2 text-base h-12 px-8 rounded-xl bg-background/50 backdrop-blur-sm">
                  <BookOpen className="h-4 w-4" /> Browse Books
                </Button>
              </Link>
            </div>
            {/* Social proof */}
            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm">
              <div className="flex -space-x-2">
                {["A", "B", "C", "D", "E"].map((letter, i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-background bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-[11px] font-semibold text-primary"
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <div className="text-muted-foreground">
                Trusted by <strong className="text-foreground">5,000+</strong> readers
              </div>
              <div className="hidden sm:block h-4 w-px bg-border" />
              <div className="flex items-center gap-1.5">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <span className="text-muted-foreground/60 text-xs">4.9/5 from 2,400+ reviews</span>
              </div>
            </div>
          </div>
        </HeroAnimation>
      </section>

      {/* ─── STATS STRIP ─── */}
      <section className="border-y bg-muted/20 px-4 py-14 relative">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <FadeUp key={i}>
                <div className="space-y-1">
                  <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CONTINUE READING ─── */}
      {continueReading.length > 0 && (
        <section className="border-b px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold">Continue Reading</h2>
                <p className="text-muted-foreground mt-1">Pick up where you left off</p>
              </div>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {continueReading.map((raw) => {
                const item = raw as unknown as PopulatedProgress;
                const book = item.bookId;
                if (!book) return null;
                return (
                  <FadeUp key={String(item._id)}>
                    <Link href={`/reader/${String(book._id)}`}>
                      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/40 h-full">
                        <CardContent className="p-0 flex">
                          <div className="w-28 shrink-0 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden">
                            {book.coverImage ? (
                              <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                            ) : (
                              <BookOpen className="h-8 w-8 text-primary/30" />
                            )}
                          </div>
                          <div className="flex-1 p-4 min-w-0">
                            <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                              {book.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">{book.author}</p>
                            <div className="mt-3 space-y-1.5">
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full transition-all duration-500"
                                  style={{ width: `${Math.round(item.percentage)}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{Math.round(item.percentage)}% complete</span>
                                <span className="text-primary font-medium">
                                  {item.percentage >= 100 ? "Finished" : `${Math.round((100 - item.percentage) * (book.totalChapters || 1) / 100)} chapters left`}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </FadeUp>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── FEATURES ─── */}
      <section className="px-4 py-24 relative overflow-hidden">
        <div className="section-shade absolute inset-0" />
        <div className="relative mx-auto max-w-6xl">
          <FadeUp>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">Everything You Need</h2>
            <p className="text-center text-muted-foreground mb-4 max-w-xl mx-auto text-lg">
              Powerful features designed for serious readers
            </p>
          </FadeUp>
          {/* Auto-save highlight card */}
          <FadeUp>
            <Card className="bento-card border mb-8 overflow-hidden">
              <div className="bento-card-shine" />
              <CardContent className="p-6 md:p-8 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10">
                    <RefreshCw className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Badge className="mb-2 bg-primary/10 text-primary text-xs font-medium border-0">
                      <Zap className="h-3 w-3 mr-1" /> Real-Time Sync
                    </Badge>
                    <h3 className="font-semibold text-xl mb-1">Auto-Save Across All Devices</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Every page turn, bookmark, and highlight syncs instantly to the cloud.
                      Switch between phone, tablet, and laptop&mdash;your progress is always waiting.
                    </p>
                  </div>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {syncFeatures.map((f, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl border bg-muted/30 p-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        {f.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{f.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </FadeUp>

          <StaggerFade className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <FadeUp key={i}>
                <Card className="bento-card h-full border overflow-hidden group">
                  <div className="bento-card-shine" />
                  <CardContent className="p-6 relative z-10">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10 mb-5 group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {feature.tags.map((tag, j) => (
                        <Badge key={j} variant="secondary" className="text-xs font-normal">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </FadeUp>
            ))}
          </StaggerFade>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="relative px-4 py-24 overflow-hidden border-y">
        <div className="grid-pattern absolute inset-0 opacity-[0.06]" />
        <div className="relative mx-auto max-w-6xl">
          <FadeUp>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">How It Works</h2>
            <p className="text-center text-muted-foreground mb-16 max-w-xl mx-auto text-lg">
              Three steps to your cloud library
            </p>
          </FadeUp>
          <StaggerFade className="relative grid gap-8 md:grid-cols-3">
            <div className="absolute top-16 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-primary/30 via-primary/10 to-primary/30 hidden md:block" />
            {steps.map((step, i) => (
              <FadeUp key={i}>
                <div className="text-center relative">
                  <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10 bg-background">
                    <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20">
                      {i + 1}
                    </span>
                    {step.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{step.description}</p>
                </div>
              </FadeUp>
            ))}
          </StaggerFade>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <FadeUp>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">Loved by Readers</h2>
            <p className="text-center text-muted-foreground mb-14 max-w-xl mx-auto text-lg">
              What our community says about the experience
            </p>
          </FadeUp>
          <StaggerFade className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <FadeUp key={i}>
                <div className="bento-card h-full rounded-xl border bg-card p-6 group">
                  <div className="bento-card-shine" />
                  <div className="relative z-10">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, j) => (
                        <svg key={j} className="h-4 w-4 text-yellow-500 fill-yellow-500" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs font-semibold text-primary ring-2 ring-background">
                        {t.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </StaggerFade>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-4xl">
          <FadeUp>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.55_0.2_265)] p-10 md:p-16 text-center text-primary-foreground shadow-2xl shadow-primary/20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.12)_0%,transparent_60%)]" />
              <div className="floating-orb w-48 h-48 top-[-30%] right-[-10%] bg-white/5 animate-pulse-glow" />
              <div className="relative">
                <Badge variant="outline" className="mb-4 border-primary-foreground/20 text-primary-foreground/80 text-xs font-normal">
                  <Zap className="h-3 w-3 mr-1" /> Get Started Today
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                  Ready to Transform Your Reading?
                </h2>
                <p className="text-lg text-primary-foreground/80 mb-8 max-w-lg mx-auto leading-relaxed">
                  Join thousands of readers who never lose their place. Start reading free today.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href={session?.user ? "/dashboard" : "/register"}>
                    <Button
                      size="lg"
                      variant="secondary"
                      className="gap-2 text-base h-12 px-8 rounded-xl shadow-xl"
                    >
                      {session?.user ? "Go to Dashboard" : "Get Started Free"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/books">
                    <Button
                      size="lg"
                      variant="outline"
                      className="gap-2 text-base h-12 px-8 rounded-xl border-primary-foreground/20 text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10"
                    >
                      <BookOpen className="h-4 w-4" /> Browse Books
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}

const stats = [
  { value: "10K+", label: "Books Uploaded" },
  { value: "5K+", label: "Active Readers" },
  { value: "50K+", label: "Chapters Read" },
  { value: "99.9%", label: "Uptime" },
];

const steps = [
  {
    icon: <Upload className="h-7 w-7 text-primary" />,
    title: "Upload Your Books",
    description: "Drag and drop your PDF files. Our system automatically extracts and organizes the content into chapters.",
  },
  {
    icon: <BookOpen className="h-7 w-7 text-primary" />,
    title: "Read Anywhere",
    description: "Access your library from any device. Your progress, bookmarks, and notes sync automatically to the cloud.",
  },
  {
    icon: <Bookmark className="h-7 w-7 text-primary" />,
    title: "Never Lose Your Place",
    description: "Auto-save keeps your reading position across sessions. Pick up exactly where you left off, every time.",
  },
];

const syncFeatures = [
  {
    icon: <RefreshCw className="h-4 w-4 text-primary" />,
    title: "Real-Time Sync",
    desc: "Every page turn saves instantly across all devices",
  },
  {
    icon: <Layers className="h-4 w-4 text-primary" />,
    title: "Smart Bookmarks",
    desc: "Highlights, notes, and bookmarks synced everywhere",
  },
  {
    icon: <CheckCircle className="h-4 w-4 text-primary" />,
    title: "Offline Ready",
    desc: "Progress caches locally, syncs when connected",
  },
];

const features = [
  {
    icon: <Cloud className="h-6 w-6 text-primary" />,
    title: "Cloud Library",
    description: "All your books in one place, accessible from any device. No more searching through folders and files.",
    tags: ["Unlimited Storage", "Any Device"],
  },
  {
    icon: <BookMarked className="h-6 w-6 text-primary" />,
    title: "Smart Bookmarks & Highlights",
    description: "Mark important passages, highlight text, and add notes that sync across every device you own.",
    tags: ["Highlights", "Annotations"],
  },
  {
    icon: <FileText className="h-6 w-6 text-primary" />,
    title: "Auto Chapter Split",
    description: "Upload any PDF and our system intelligently splits it into chapters with smart text extraction.",
    tags: ["PDF Support", "Smart Parsing"],
  },
  {
    icon: <Library className="h-6 w-6 text-primary" />,
    title: "Beautiful Reading Experience",
    description: "Clean, distraction-free interface with customizable fonts, themes, and layout options.",
    tags: ["Focus Mode", "Custom Themes"],
  },
  {
    icon: <Zap className="h-6 w-6 text-primary" />,
    title: "Lightning Fast",
    description: "Optimized for speed. Pages load instantly and navigation is buttery smooth.",
    tags: ["Optimized", "Fast"],
  },
  {
    icon: <Heart className="h-6 w-6 text-primary" />,
    title: "Reading Insights",
    description: "Track your reading habits, set goals, and discover patterns in your reading journey.",
    tags: ["Statistics", "Goals"],
  },
];

const testimonials = [
  {
    quote: "I read across three devices daily. Never having to find my page again has been a game-changer for my reading habit.",
    name: "Sarah Chen",
    role: "Avid Reader",
  },
  {
    quote: "The auto-save is flawless. I can switch from my iPad to phone mid-chapter without skipping a beat.",
    name: "Marcus Johnson",
    role: "Book Blogger",
  },
  {
    quote: "Uploaded my entire PDF library in minutes. The chapter splitting is uncannily accurate.",
    name: "Emily Rodriguez",
    role: "PhD Candidate",
  },
];
