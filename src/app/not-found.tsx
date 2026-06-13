import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookX, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex items-center justify-center min-h-[60vh] px-4 py-12 overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute inset-0 section-shade" />
      <div className="floating-orb w-96 h-96 top-[-20%] right-[-10%] bg-primary/10 animate-pulse-glow" />
      <Card className="relative max-w-md w-full border-border/60 shadow-xl">
        <CardContent className="p-10 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">
            404
          </p>
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-5">
            <BookX className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="font-display text-2xl font-semibold tracking-tight mb-2">
            Page not found
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-7">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="gradient" className="gap-2 w-full">
                <Home className="h-4 w-4" /> Go home
              </Button>
            </Link>
            <Link href="/books" className="w-full sm:w-auto">
              <Button variant="outline" className="gap-2 w-full">
                <Search className="h-4 w-4" /> Browse library
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
