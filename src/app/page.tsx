import Link from "next/link";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import ReadingProgress from "@/models/ReadingProgress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Section, SectionHeading, SectionLabel } from "@/components/ui/section";
import { FadeUp, StaggerContainer, StaggerItem, HeroMotion } from "@/components/ui/motion";
import {
  BookOpen, Cloud, BookMarked, ArrowRight, Upload, Bookmark, RefreshCw,
  CheckCircle, Layers, Zap, FileText, Heart, Library, Quote, ArrowUpRight, Star,
} from "lucide-react";

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
      <Hero />

      <StatsStrip />

      {continueReading.length > 0 && <ContinueReadingSection items={continueReading} />}

      <FeaturesSection />

      <HowItWorksSection />

      <TestimonialsSection />

      <CTASection loggedIn={!!session?.user} />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-32 lg:pt-36 lg:pb-40">
      <div className="hero-glow" />
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div className="absolute inset-0 section-shade" />

      <div className="floating-orb w-[28rem] h-[28rem] -top-32 -left-32 bg-primary/15 animate-pulse-glow" />
      <div
        className="floating-orb w-[26rem] h-[26rem] bottom-[-25%] right-[-15%] animate-pulse-glow"
        style={{ background: "oklch(0.6 0.22 295 / 0.12)" }}
      />
      <div
        className="floating-orb w-96 h-96 top-[40%] left-[50%] -translate-x-1/2 animate-pulse-glow"
        style={{ background: "oklch(0.55 0.2 235 / 0.08)", animationDelay: "2s" }}
      />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <HeroMotion>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 glass px-3.5 py-1.5 text-xs font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="text-muted-foreground">New</span>
            <span className="text-foreground/80">Real-time cloud sync</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-semibold tracking-[-0.04em] leading-[0.98]">
            Read anywhere.
            <br />
            <span className="gradient-text inline-block mt-1">Never lose your page.</span>
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Upload your books once. Read seamlessly across every device.
            Auto-saving tracks every page, every bookmark, every highlight —
            so you never have to search for where you left off.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register" className="w-full sm:w-auto">
              <Button
                size="xl"
                variant="gradient"
                className="w-full gap-2 shadow-2xl shadow-primary/30"
              >
                Start reading free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/books" className="w-full sm:w-auto">
              <Button
                size="xl"
                variant="outline"
                className="w-full gap-2 glass"
              >
                <BookOpen className="h-4 w-4" /> Browse library
              </Button>
            </Link>
          </div>

          <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-5 text-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex -space-x-2">
                {["SC", "MJ", "ER", "DK", "AL"].map((initials, i) => (
                  <div
                    key={i}
                    className="h-7 w-7 rounded-full border-2 border-background bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-[9px] font-bold text-primary"
                    style={{ zIndex: 5 - i }}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <span className="text-muted-foreground">
                <strong className="text-foreground font-semibold">5,000+</strong> readers
              </span>
            </div>
            <span className="hidden sm:block h-4 w-px bg-border" />
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <span className="text-muted-foreground">
                4.9/5 from <strong className="text-foreground font-semibold">2,400+</strong> reviews
              </span>
            </div>
          </div>
        </HeroMotion>
      </div>
    </section>
  );
}

function StatsStrip() {
  return (
    <section className="border-y border-border/60 bg-muted/30 relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-6">
          {stats.map((stat) => (
            <StaggerItem key={stat.label} className="text-center md:text-left">
              <div className="font-display text-4xl sm:text-5xl font-semibold tracking-tight gradient-text">
                {stat.value}
              </div>
              <div className="mt-1.5 text-sm text-muted-foreground">{stat.label}</div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

function ContinueReadingSection({ items }: { items: Record<string, unknown>[] }) {
  return (
    <Section pad="xl">
      <div className="flex items-end justify-between mb-10">
        <div>
          <SectionLabel>Pick up where you left off</SectionLabel>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Continue reading
          </h2>
        </div>
        <Link href="/dashboard" className="hidden sm:inline-flex">
          <Button variant="ghost" size="sm" className="gap-1.5">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
      <StaggerContainer className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((raw) => {
          const item = raw as unknown as PopulatedProgress;
          const book = item.bookId;
          if (!book) return null;
          const pct = Math.round(item.percentage);
          return (
            <StaggerItem key={String(item._id)}>
              <Link href={`/reader/${String(book._id)}`} className="group block">
                <Card className="overflow-hidden h-full bento-card">
                  <div className="bento-card-shine" />
                  <CardContent className="p-0 flex">
                    <div className="w-28 sm:w-32 shrink-0 bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center overflow-hidden relative">
                      {book.coverImage ? (
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <BookOpen className="h-8 w-8 text-primary/40" />
                      )}
                    </div>
                    <div className="flex-1 p-5 min-w-0 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {book.author}
                        </p>
                      </div>
                      <div className="mt-4 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{pct}% complete</span>
                          <span className="font-medium text-primary">
                            {pct >= 100 ? "Finished" : "Continue"}
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary/70 to-primary rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </Section>
  );
}

function FeaturesSection() {
  return (
    <Section pad="xl" className="relative">
      <div className="section-shade absolute inset-0" />
      <div className="relative">
        <SectionHeading
          align="center"
          title={
            <>
              Everything you need to
              <br />
              <span className="gradient-text">actually finish books.</span>
            </>
          }
          description="Powerful features designed for serious readers. No clutter, no gimmicks — just a beautiful place to read."
        />

        <FadeUp>
          <Card className="bento-card relative overflow-hidden mb-6">
            <div className="bento-card-shine" />
            <CardContent className="p-8 sm:p-10 relative">
              <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/30">
                  <RefreshCw className="h-7 w-7 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <Badge variant="soft" className="mb-2.5">
                    <Zap className="h-3 w-3 mr-1" /> Real-time sync
                  </Badge>
                  <h3 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight mb-2">
                    Auto-save across every device
                  </h3>
                  <p className="text-muted-foreground leading-relaxed max-w-2xl">
                    Every page turn, bookmark, and highlight syncs instantly to the cloud.
                    Switch between phone, tablet, and laptop — your progress is always
                    exactly where you left it.
                  </p>
                </div>
              </div>

              <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
                {syncFeatures.map((f) => (
                  <div
                    key={f.title}
                    className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/50 p-4 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      {f.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{f.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeUp>

        <StaggerContainer className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <StaggerItem key={feature.title}>
              <Card className="bento-card h-full">
                <div className="bento-card-shine" />
                <CardContent className="p-6 relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/10 mb-5 group-hover:from-primary/25 group-hover:to-primary/10 transition-all">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-2 tracking-tight">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {feature.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs font-normal">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </Section>
  );
}

function HowItWorksSection() {
  return (
    <Section pad="xl" className="relative border-y border-border/60">
      <div className="grid-pattern absolute inset-0 opacity-30" />
      <div className="relative">
        <SectionHeading
          align="center"
          title={
            <>
              Three steps to your
              <br />
              <span className="font-display italic">cloud library</span>
            </>
          }
          description="No setup, no friction. Just upload, read, and pick up exactly where you left off."
        />

        <StaggerContainer className="relative grid gap-8 md:grid-cols-3">
          <div className="absolute top-12 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent hidden md:block" />
          {steps.map((step, i) => (
            <StaggerItem key={step.title}>
              <div className="text-center relative">
                <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-background to-muted border border-border/60 shadow-sm">
                  <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-md shadow-primary/30">
                    {i + 1}
                  </span>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {step.icon}
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2 tracking-tight">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </Section>
  );
}

function TestimonialsSection() {
  return (
    <Section pad="xl">
      <SectionHeading
        align="center"
        title="Loved by readers everywhere"
        description="Real readers, real reading habits transformed."
      />

      <StaggerContainer className="grid gap-5 md:grid-cols-3">
        {testimonials.map((t) => (
          <StaggerItem key={t.name}>
            <Card className="bento-card h-full relative">
              <div className="bento-card-shine" />
              <CardContent className="p-6 relative">
                <Quote className="h-7 w-7 text-primary/20 mb-3" />
                <p className="text-sm text-foreground/90 leading-relaxed mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-sm font-semibold text-primary-foreground shadow-sm">
                    {t.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </Section>
  );
}

function CTASection({ loggedIn }: { loggedIn: boolean }) {
  return (
    <Section pad="xl">
      <FadeUp>
        <div className="relative overflow-hidden rounded-3xl p-10 sm:p-16 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-[oklch(0.55_0.22_295)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15)_0%,transparent_50%),radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
          <div className="floating-orb w-72 h-72 top-[-30%] right-[-10%] bg-white/10 animate-pulse-glow" />
          <div
            className="floating-orb w-72 h-72 bottom-[-30%] left-[-10%] animate-pulse-glow"
            style={{ background: "oklch(0.6 0.18 235 / 0.2)", animationDelay: "1.5s" }}
          />
          <div className="absolute inset-0 dot-pattern opacity-20" />

          <div className="relative">
            <Badge variant="outline" className="mb-5 border-white/20 bg-white/10 text-white text-xs font-medium backdrop-blur-sm">
              <Zap className="h-3 w-3 mr-1" /> Get started in 30 seconds
            </Badge>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white mb-5 leading-[1.05]">
              Ready to transform
              <br />
              your reading?
            </h2>
            <p className="text-lg text-white/80 mb-9 max-w-md mx-auto leading-relaxed">
              Join thousands of readers who never lose their place. Free forever, no credit card.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href={loggedIn ? "/dashboard" : "/register"} className="w-full sm:w-auto">
                <Button
                  size="xl"
                  className="w-full gap-2 bg-white text-primary hover:bg-white/95 shadow-2xl shadow-black/20"
                >
                  {loggedIn ? "Open dashboard" : "Start reading free"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/books" className="w-full sm:w-auto">
                <Button
                  size="xl"
                  variant="outline"
                  className="w-full gap-2 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
                >
                  Browse library
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </FadeUp>
    </Section>
  );
}

const stats = [
  { value: "10K+", label: "Books uploaded" },
  { value: "5K+", label: "Active readers" },
  { value: "50K+", label: "Chapters read" },
  { value: "99.9%", label: "Uptime" },
];

const steps = [
  {
    icon: <Upload className="h-6 w-6" />,
    title: "Upload your books",
    description: "Drag and drop your PDF files. Our system automatically extracts and organizes the content into chapters.",
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: "Read anywhere",
    description: "Access your library from any device. Your progress, bookmarks, and notes sync automatically to the cloud.",
  },
  {
    icon: <Bookmark className="h-6 w-6" />,
    title: "Never lose your place",
    description: "Auto-save keeps your reading position across sessions. Pick up exactly where you left off, every time.",
  },
];

const syncFeatures = [
  {
    icon: <RefreshCw className="h-4 w-4 text-primary" />,
    title: "Real-time sync",
    desc: "Every page turn saves instantly across all devices",
  },
  {
    icon: <Layers className="h-4 w-4 text-primary" />,
    title: "Smart bookmarks",
    desc: "Highlights, notes, and bookmarks synced everywhere",
  },
  {
    icon: <CheckCircle className="h-4 w-4 text-primary" />,
    title: "Offline ready",
    desc: "Progress caches locally, syncs when connected",
  },
];

const features = [
  {
    icon: <Cloud className="h-6 w-6 text-primary" />,
    title: "Cloud library",
    description: "All your books in one place, accessible from any device. No more searching through folders and files.",
    tags: ["Unlimited storage", "Any device"],
  },
  {
    icon: <BookMarked className="h-6 w-6 text-primary" />,
    title: "Smart bookmarks & highlights",
    description: "Mark important passages, highlight text, and add notes that sync across every device you own.",
    tags: ["Highlights", "Annotations"],
  },
  {
    icon: <FileText className="h-6 w-6 text-primary" />,
    title: "Auto chapter split",
    description: "Upload any PDF and our system intelligently splits it into chapters with smart text extraction.",
    tags: ["PDF support", "Smart parsing"],
  },
  {
    icon: <Library className="h-6 w-6 text-primary" />,
    title: "Beautiful reading experience",
    description: "Clean, distraction-free interface with customizable fonts, themes, and layout options.",
    tags: ["Focus mode", "Custom themes"],
  },
  {
    icon: <Zap className="h-6 w-6 text-primary" />,
    title: "Lightning fast",
    description: "Optimized for speed. Pages load instantly and navigation is buttery smooth.",
    tags: ["Optimized", "Fast"],
  },
  {
    icon: <Heart className="h-6 w-6 text-primary" />,
    title: "Reading insights",
    description: "Track your reading habits, set goals, and discover patterns in your reading journey.",
    tags: ["Statistics", "Goals"],
  },
];

const testimonials = [
  {
    quote: "I read across three devices daily. Never having to find my page again has been a game-changer for my reading habit.",
    name: "Sarah Chen",
    role: "Avid reader",
  },
  {
    quote: "The auto-save is flawless. I can switch from my iPad to phone mid-chapter without skipping a beat.",
    name: "Marcus Johnson",
    role: "Book blogger",
  },
  {
    quote: "Uploaded my entire PDF library in minutes. The chapter splitting is uncannily accurate.",
    name: "Emily Rodriguez",
    role: "PhD candidate",
  },
];
