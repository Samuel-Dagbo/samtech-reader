"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
      <div className="absolute inset-0 section-shade" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-destructive/15 to-destructive/5 ring-1 ring-destructive/10 mb-5">
          <AlertTriangle className="h-7 w-7 text-destructive" />
        </div>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-center">Admin error</h2>
        <p className="text-muted-foreground text-center max-w-md text-sm mt-2">
          Failed to load this admin page. Please try again.
        </p>
        <div className="flex justify-center mt-5">
          <Button onClick={reset} className="gap-2 shadow-lg shadow-primary/25">
            <RefreshCw className="h-4 w-4" /> Try again
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
