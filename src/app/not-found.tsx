"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookX, Home, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="relative flex items-center justify-center min-h-[60vh] px-4 py-12 overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute inset-0 section-shade" />
      <div className="floating-orb w-96 h-96 top-[-20%] right-[-10%] bg-primary/10 animate-pulse-glow" />
      <div
        className="floating-orb w-80 h-80 bottom-[-15%] left-[-10%] animate-pulse-glow"
        style={{ background: "oklch(0.6 0.22 295 / 0.1)" }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card className="relative max-w-md w-full border-border/60 shadow-xl">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <CardContent className="p-10 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-3 font-semibold">
              Error 404
            </p>
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/10 mb-5">
              <BookX className="h-7 w-7 text-primary" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight mb-2 text-balance">
              Page not found
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-7">
              The page you&apos;re looking for doesn&apos;t exist or has been moved to a new home.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <Link href="/" className="w-full sm:w-auto">
                <Button className="gap-2 w-full shadow-lg shadow-primary/25">
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
      </motion.div>
    </div>
  );
}
