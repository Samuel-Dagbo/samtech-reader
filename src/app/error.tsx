"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function ErrorPage({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="relative flex items-center justify-center min-h-[60vh] px-4 py-12 overflow-hidden">
      <div className="absolute inset-0 section-shade" />
      <div className="floating-orb w-96 h-96 top-[-20%] left-[-10%] bg-destructive/10 animate-pulse-glow" />
      <Card className="relative max-w-md w-full border-border/60 shadow-xl">
        <CardContent className="p-10 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 mb-5">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <h2 className="font-display text-2xl font-semibold tracking-tight mb-2">
            Something went wrong
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-7">
            An unexpected error occurred while loading this page. Please try again.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <Button onClick={reset} variant="gradient" className="gap-2 w-full sm:w-auto">
              <RefreshCw className="h-4 w-4" /> Try again
            </Button>
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" className="gap-2 w-full">
                <Home className="h-4 w-4" /> Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
