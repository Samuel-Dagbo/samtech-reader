"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function AdminError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
      <AlertTriangle className="h-12 w-12 text-destructive" />
      <h2 className="text-xl font-semibold">Admin Error</h2>
      <p className="text-muted-foreground text-center max-w-md">
        Failed to load admin page. Please try again.
      </p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
