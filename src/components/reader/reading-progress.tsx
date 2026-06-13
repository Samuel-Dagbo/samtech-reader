"use client";

interface ReadingProgressProps {
  percentage: number;
}

export function ReadingProgressBar({ percentage }: ReadingProgressProps) {
  return (
    <div className="fixed top-16 left-0 right-0 z-40 h-0.5 bg-border/40">
      <div
        className="h-full bg-gradient-to-r from-primary to-[oklch(0.6_0.22_295)] transition-all duration-300 ease-out shadow-sm shadow-primary/50"
        style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
      />
    </div>
  );
}
