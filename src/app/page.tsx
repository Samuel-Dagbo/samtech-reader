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
  Layers,
  Zap,
  FileText,
  Heart,
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
        <div className="floating-orb w-72 h-72 top-[-5%] left-[-5%] bg-primary/10 animate-pulse-glow" />
        <div className="floating-orb w-96 h-96 bottom-[-10%] right-[-8%] bg-[oklch(0.6_0.18_265)]/8 animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        <HeroAnimation>
          <div className="relative mx-auto max-w-6xl">
            <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-24">
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

              {/* Right: Reader Mockup */}
              <div className="shrink-0 hidden lg:block w-[400px]">
                <div className="reader-frame p-1 animate-float">
                  <div className="reader-notch" />
                  {/* Screen header */}
                  <div className="flex items-center gap-2 px-5 pt-6 pb-3">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-400/50" />
                      <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/50" />
                      <div className="h-2.5 w-2.5 rounded-full bg-green-400/50" />
                    </div>
                    <div className="ml-3 flex items-center gap-2 text-[11px] text-white/40 font-medium tracking-wide">
                      <BookOpen className="h-3 w-3" /> SamTech Reader
                    </div>
                  </div>
                  {/* Book content */}
                  <div className="px-5 pb-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className="bg-primary/20 text-primary text-[10px] px-2 py-0 font-medium border-0">
                        Chapter 7
                      </Badge>
                      <span className="text-[11px] text-white/30">The Dawn of Understanding</span>
                    </div>
                    <div className="space-y-2.5 reader-text">
                      <p className="text-[13px] text-white/80 leading-relaxed">
                        The morning light streamed through the tall windows, casting long
                        shadows across the polished wooden floor. She sat by the window, the
                        book open in her lap, her eyes tracing the words with quiet intention.
                      </p>
                      <p className="text-[13px] text-white/60 leading-relaxed">
                        Each page turned felt like stepping into a new world, the weight of
                        the paper and the smell of ink grounding her in the present moment.
                        She had been reading for hours, yet the time had passed unnoticed.
                      </p>
                      <p className="text-[13px] text-white/50 leading-relaxed">
                        The chapter drew to a close, the final paragraphs weaving together
                        threads of thought she hadn&rsquo;t realized were connected. She
                        placed a bookmark between the pages and closed the book gently.
                      </p>
                    </div>
                    {/* Progress */}
                    <div className="mt-5 pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] text-white/40">Reading progress</span>
                        <span className="text-[11px] text-primary font-medium">72%</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-[72%] bg-gradient-to-r from-primary/60 to-primary rounded-full" />
                      </div>
                    </div>
                  </div>
                  {/* Sync badge */}
                  <div className="absolute -top-3 -right-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-background/90 backdrop-blur-xl px-3 py-1.5 shadow-lg">
                    <RefreshCw className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-medium text-foreground/80">Auto-sync</span>
                  </div>
                </div>
                {/* Device labels */}
                <div className="mt-6 flex items-center justify-center gap-5 text-muted-foreground/40">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    <span className="text-xs">Desktop</span>
                  </div>
                  <div className="h-3 w-px bg-border" />
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <span className="text-xs">Phone</span>
                  </div>
                  <div className="h-3 w-px bg-border" />
                  <div className="flex items-center gap-2">
                    <TabletIcon className="h-4 w-4" />
                    <span className="text-xs">Tablet</span>
                  </div>
                </div>
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

          <StaggerFade className="grid gap-8 lg:grid-cols-2">
            {/* Sync visual - two reader cards side by side */}
            <FadeUp>
              <Card className="bento-card h-full border overflow-hidden">
                <div className="bento-card-shine" />
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Smartphone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Phone &bull; Chapter 7</h3>
                      <p className="text-sm text-muted-foreground">Last read 2 min ago</p>
                    </div>
                  </div>
                  <div className="reader-frame-light rounded-xl overflow-hidden">
                    <div className="px-4 pt-4 pb-3">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-primary/10 text-primary text-[10px] px-2 py-0 font-medium border-0">
                          Chapter 7
                        </Badge>
                        <span className="text-[10px] text-muted-foreground/50">The Dawn of Understanding</span>
                      </div>
                      <p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-4">
                        The morning light streamed through the tall windows, casting long
                        shadows across the polished wooden floor. She sat by the window, the
                        book open in her lap, her eyes tracing the words with quiet intention.
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden mr-3">
                          <div className="h-full w-[72%] bg-primary rounded-full" />
                        </div>
                        <span className="text-[10px] font-medium text-primary">72%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeUp>

            <FadeUp>
              <Card className="bento-card h-full border overflow-hidden">
                <div className="bento-card-shine" />
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Monitor className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Desktop &bull; Chapter 7</h3>
                      <p className="text-sm text-muted-foreground">Synced from phone</p>
                    </div>
                  </div>
                  <div className="reader-frame-light rounded-xl overflow-hidden">
                    <div className="px-4 pt-4 pb-3">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-primary/10 text-primary text-[10px] px-2 py-0 font-medium border-0">
                          Chapter 7
                        </Badge>
                        <span className="text-[10px] text-muted-foreground/50">The Dawn of Understanding</span>
                      </div>
                      <p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-4">
                        The morning light streamed through the tall windows, casting long
                        shadows across the polished wooden floor. She sat by the window, the
                        book open in her lap, her eyes tracing the words with quiet intention.
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden mr-3">
                          <div className="h-full w-[72%] bg-primary rounded-full" />
                        </div>
                        <span className="text-[10px] font-medium text-primary">72%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeUp>
          </StaggerFade>

          {/* Sync features row */}
          <StaggerFade className="grid gap-4 mt-8 md:grid-cols-3">
            {syncFeatures.map((feature, i) => (
              <FadeUp key={i}>
                <Card className="border-0 bg-background/40 backdrop-blur-sm">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-0.5">{feature.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </FadeUp>
            ))}
          </StaggerFade>
        </div>
      </section>

      {/* ─── FEATURES GRID ─── */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <FadeUp>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">Everything You Need</h2>
            <p className="text-center text-muted-foreground mb-16 max-w-xl mx-auto text-lg">
              Powerful features designed for serious readers
            </p>
          </FadeUp>
          <StaggerFade className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <FadeUp key={i}>
                <Card
                  className={`bento-card h-full border overflow-hidden group ${feature.featured ? "md:col-span-2 lg:col-span-3" : ""}`}
                >
                  <div className="bento-card-shine" />
                  <CardContent className={`p-6 relative z-10 ${feature.featured ? "md:flex md:items-center md:gap-8" : ""}`}>
                    <div className={`flex ${feature.featured ? "h-16 w-16" : "h-12 w-12"} items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10 mb-5 group-hover:from-primary/20 group-hover:to-primary/10 transition-colors`}>
                      {feature.icon}
                    </div>
                    <div className={feature.featured ? "flex-1" : ""}>
                      <h3 className={`font-semibold ${feature.featured ? "text-xl" : "text-lg"} mb-2`}>{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {feature.tags.map((tag, j) => (
                          <Badge key={j} variant="secondary" className="text-xs font-normal">
                            {tag}
                          </Badge>
                        ))}
                      </div>
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
        <div className="section-shade absolute inset-0" />
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

function TabletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <line x1="12" x2="12.01" y1="18" y2="18" />
    </svg>
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
    description: "Every page turn saves instantly. Close the tab, switch devices, resume where you left off.",
  },
  {
    icon: <Layers className="h-5 w-5 text-primary" />,
    title: "Smart Bookmarks & Highlights",
    description: "Bookmark passages, highlight text, add notes. All synced across every device.",
  },
  {
    icon: <CheckCircle className="h-5 w-5 text-primary" />,
    title: "Offline Resilience",
    description: "Progress caches locally. When you reconnect, everything syncs seamlessly.",
  },
];

const features = [
  {
    icon: <RefreshCw className="h-6 w-6 text-primary" />,
    title: "Real-Time Cloud Sync",
    description: "Your reading position, bookmarks, and highlights sync across all devices automatically. Start on your phone, finish on your laptop.",
    tags: ["Real-time", "Cross-device", "Auto-save"],
    featured: false,
  },
  {
    icon: <BookMarked className="h-6 w-6 text-primary" />,
    title: "Smart Bookmarks",
    description: "Never lose a thought. Bookmark passages, highlight text, and add notes that sync everywhere.",
    tags: ["Highlights", "Annotations"],
    featured: false,
  },
  {
    icon: <FileText className="h-6 w-6 text-primary" />,
    title: "Auto Chapter Split",
    description: "Upload any PDF and our system intelligently splits it into chapters with smart text extraction.",
    tags: ["PDF Support", "Smart Parsing"],
    featured: false,
  },
  {
    icon: <Cloud className="h-6 w-6 text-primary" />,
    title: "Cloud Library",
    description: "All your books in one place, accessible from any device. No more searching through folders and files.",
    tags: ["Unlimited Storage", "Any Device"],
    featured: false,
  },
  {
    icon: <Heart className="h-6 w-6 text-primary" />,
    title: "Distraction-Free Reading",
    description: "Clean, minimal interface designed for deep focus. Customize fonts, spacing, and themes to your liking.",
    tags: ["Focus Mode", "Custom Themes"],
    featured: false,
  },
  {
    icon: <Zap className="h-6 w-6 text-primary" />,
    title: "Lightning Fast",
    description: "Optimized for speed. Pages load instantly, chapters render in milliseconds, and navigation is buttery smooth.",
    tags: ["Optimized", "Fast"],
    featured: false,
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
