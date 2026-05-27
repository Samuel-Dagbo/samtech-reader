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
  Monitor,
  Smartphone,
  RefreshCw,
  CheckCircle,
  Quote,
  Layers,
  Zap,
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
      <section className="relative overflow-hidden px-4 pt-20 pb-28 md:pt-28 md:pb-36 lg:pt-36 lg:pb-48">
        <div className="hero-glow" />
        <div className="mesh-gradient absolute inset-0" />
        <div className="grid-pattern absolute inset-0 opacity-[0.12]" />
        {/* Floating Orbs */}
        <div className="floating-orb w-72 h-72 top-[-5%] left-[-5%] bg-primary/10 animate-pulse-glow" />
        <div className="floating-orb w-96 h-96 bottom-[-10%] right-[-8%] bg-[oklch(0.6_0.18_265)]/8 animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        {/* Decorative dots */}
        <div className="absolute top-20 right-[15%] hidden lg:block">
          <div className="grid grid-cols-3 gap-3 opacity-20">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-1.5 w-1.5 rounded-full bg-primary" />
            ))}
          </div>
        </div>
        <div className="absolute bottom-32 left-[8%] hidden lg:block">
          <div className="grid grid-cols-4 gap-2.5 opacity-15">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-1 w-1 rounded-full bg-primary" />
            ))}
          </div>
        </div>
        <HeroAnimation>
          <div className="relative mx-auto max-w-6xl">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              {/* Left: Text */}
              <div className="flex-1 text-center lg:text-left">
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
                <p className="mx-auto lg:mx-0 mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
                  Upload your books once. Read seamlessly across every device.
                  Auto-saving tracks every page, every bookmark, every highlight&mdash;so
                  you never have to search for where you left off.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row items-center lg:justify-start gap-4">
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
                {/* Trusted by line */}
                <div className="mt-12 flex items-center justify-center lg:justify-start gap-6 text-xs text-muted-foreground">
                  <div className="flex -space-x-2">
                    {["A", "B", "C", "D", "E"].map((letter, i) => (
                      <div
                        key={i}
                        className="h-7 w-7 rounded-full border-2 border-background bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-[10px] font-semibold text-primary"
                      >
                        {letter}
                      </div>
                    ))}
                  </div>
                  <span className="text-muted-foreground/60">Trusted by <strong className="text-foreground">5,000+</strong> readers</span>
                </div>
              </div>

              {/* Right: Book Mockup + Device Indicators */}
              <div className="shrink-0 hidden lg:flex flex-col items-center">
                <div className="book-mockup animate-float">
                  <div className="book-mockup-spine" />
                  <div className="book-mockup-inner" />
                  <div className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 backdrop-blur-xl flex items-center justify-center">
                    <BookMarked className="h-6 w-6 text-primary/60" />
                  </div>
                  {/* Sync indicator */}
                  <div className="absolute -bottom-3 -left-3 flex items-center gap-2 rounded-xl border bg-background/80 backdrop-blur-xl px-3 py-2 shadow-lg animate-float-delayed">
                    <RefreshCw className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[11px] font-medium">Auto-sync</span>
                  </div>
                </div>
                {/* Device icons */}
                <div className="mt-8 flex items-center gap-6 text-muted-foreground/40">
                  <Monitor className="h-5 w-5" />
                  <div className="h-px w-8 bg-border" />
                  <Smartphone className="h-5 w-5" />
                  <div className="h-px w-8 bg-border" />
                  <BookOpen className="h-5 w-5" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground/50">All devices. One place.</p>
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

      {/* ─── AUTO-SAVE & SYNC ─── */}
      <section className="relative px-4 py-24 overflow-hidden border-b">
        <div className="mesh-gradient absolute inset-0" />
        <div className="section-shade absolute inset-0" />
        <div className="relative mx-auto max-w-6xl">
          <FadeUp>
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 px-3 py-1 text-xs font-normal border-primary/20 text-primary bg-primary/5">
                <Zap className="h-3 w-3 mr-1" /> Core Technology
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Your Progress Saves <span className="gradient-text">Instantly</span>
              </h2>
              <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-lg">
                Every page turn, bookmark, and highlight syncs to the cloud in real-time.
                Switch between phone, tablet, and laptop without missing a word.
              </p>
            </div>
          </FadeUp>

          <StaggerFade className="grid gap-6 lg:grid-cols-2">
            {/* Sync visual card */}
            <FadeUp>
              <div className="bento-card rounded-2xl border p-8 bg-background/80 backdrop-blur-sm h-full">
                <div className="bento-card-shine" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <RefreshCw className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Cross-Device Sync</h3>
                      <p className="text-sm text-muted-foreground">Real-time cloud synchronization</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Laptop */}
                    <div className="device-mockup p-4 pt-9">
                      <Monitor className="h-6 w-6 text-primary/40 mb-2" />
                      <div className="h-2 w-3/4 rounded bg-primary/10 mb-1" />
                      <div className="flex items-center gap-1.5 text-[10px] text-primary font-medium">
                        <CheckCircle className="h-3 w-3" /> Chapter 12
                      </div>
                    </div>
                    {/* Phone */}
                    <div className="device-mockup p-4 pt-9">
                      <Smartphone className="h-6 w-6 text-primary/40 mb-2" />
                      <div className="h-2 w-3/4 rounded bg-primary/10 mb-1" />
                      <div className="flex items-center gap-1.5 text-[10px] text-primary font-medium">
                        <CheckCircle className="h-3 w-3" /> Chapter 12
                      </div>
                    </div>
                    {/* Tablet */}
                    <div className="device-mockup p-4 pt-9">
                      <BookOpen className="h-6 w-6 text-primary/40 mb-2" />
                      <div className="h-2 w-3/4 rounded bg-primary/10 mb-1" />
                      <div className="flex items-center gap-1.5 text-[10px] text-primary font-medium">
                        <CheckCircle className="h-3 w-3" /> Chapter 12
                      </div>
                    </div>
                    {/* Cloud */}
                    <div className="device-mockup p-4 pt-9">
                      <Cloud className="h-6 w-6 text-primary/40 mb-2" />
                      <div className="h-2 w-3/4 rounded bg-primary/10 mb-1" />
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <RefreshCw className="h-3 w-3" /> Synced
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeUp>

            {/* Feature list card */}
            <FadeUp>
              <div className="bento-card rounded-2xl border p-8 bg-background/80 backdrop-blur-sm h-full">
                <div className="bento-card-shine" />
                <div className="relative z-10 space-y-8">
                  {syncFeatures.map((feature, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>
          </StaggerFade>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="relative px-4 py-24 overflow-hidden border-b">
        <div className="grid-pattern absolute inset-0 opacity-[0.06]" />
        <div className="relative mx-auto max-w-6xl">
          <FadeUp>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">How It Works</h2>
            <p className="text-center text-muted-foreground mb-16 max-w-xl mx-auto text-lg">
              Three steps to your cloud library
            </p>
          </FadeUp>
          <StaggerFade className="relative grid gap-8 md:grid-cols-3">
            {/* Connecting line */}
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

      {/* ─── BENTO FEATURES ─── */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <FadeUp>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">Everything You Need</h2>
            <p className="text-center text-muted-foreground mb-14 max-w-xl mx-auto text-lg">
              Powerful features designed for serious readers
            </p>
          </FadeUp>
          <StaggerFade className="grid gap-4 md:grid-cols-3 auto-rows-[1fr]">
            {bentoFeatures.map((feature, i) => (
              <FadeUp key={i}>
                <Card className={`bento-card h-full group border ${feature.span ? "md:col-span-2" : ""}`}>
                  <div className="bento-card-shine" />
                  <CardContent className="p-6 relative z-10">
                    <div className={`flex ${feature.span ? "flex-row items-center gap-6" : "flex-col"}`}>
                      <div className={`${feature.span ? "shrink-0" : ""} mb-5 ${feature.span ? "mb-0" : ""} flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10 group-hover:from-primary/20 group-hover:to-primary/10 transition-colors`}>
                        {feature.icon}
                      </div>
                      <div className={feature.span ? "flex-1" : ""}>
                        <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {feature.tags.map((tag, j) => (
                            <Badge key={j} variant="secondary" className="text-xs font-normal">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeUp>
            ))}
          </StaggerFade>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="relative px-4 py-24 overflow-hidden border-y">
        <div className="section-shade absolute inset-0" />
        <div className="relative mx-auto max-w-6xl">
          <FadeUp>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">Loved by Readers</h2>
            <p className="text-center text-muted-foreground mb-14 max-w-xl mx-auto text-lg">
              What our community says about the experience
            </p>
          </FadeUp>
          <StaggerFade className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <FadeUp key={i}>
                <Card className="bento-card h-full border">
                  <div className="bento-card-shine" />
                  <CardContent className="p-6 relative z-10">
                    <Quote className="h-6 w-6 text-primary/20 mb-3" />
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs font-semibold text-primary">
                        {t.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeUp>
            ))}
          </StaggerFade>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="px-4 py-24">
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
                  Join thousands of readers who never lose their place.
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
    icon: <RefreshCw className="h-5 w-5 text-primary" />,
    title: "Real-Time Auto-Save",
    description: "Every page turn is saved instantly. Close the tab, switch devices, and pick up from the exact same sentence.",
  },
  {
    icon: <Layers className="h-5 w-5 text-primary" />,
    title: "Smart Bookmarks & Highlights",
    description: "Bookmark passages, highlight text, and add notes. All synced across every device you own.",
  },
  {
    icon: <CheckCircle className="h-5 w-5 text-primary" />,
    title: "Offline Resilience",
    description: "Reading progress is cached locally. When connectivity returns, everything syncs seamlessly.",
  },
];

const bentoFeatures = [
  {
    icon: <RefreshCw className="h-6 w-6 text-primary" />,
    title: "Real-Time Cloud Sync",
    description: "Your reading position, bookmarks, and highlights sync across all devices automatically. Start on your phone, finish on your laptop.",
    tags: ["Real-time", "Cross-device", "Auto-save"],
    span: true,
  },
  {
    icon: <BookMarked className="h-6 w-6 text-primary" />,
    title: "Smart Bookmarks",
    description: "Never lose a thought. Bookmark passages, highlight text, and add notes that sync everywhere.",
    tags: ["Highlights", "Annotations"],
    span: false,
  },
  {
    icon: <BookOpen className="h-6 w-6 text-primary" />,
    title: "Auto Chapter Split",
    description: "Upload any PDF and our system intelligently splits it into chapters with smart text extraction.",
    tags: ["PDF Support", "Smart Parsing"],
    span: false,
  },
  {
    icon: <Cloud className="h-6 w-6 text-primary" />,
    title: "Cloud Library",
    description: "All your books in one place, accessible from any device. No more searching through folders and files.",
    tags: ["Unlimited Storage", "Any Device"],
    span: true,
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
