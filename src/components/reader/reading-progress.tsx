"use client";

interface ReadingProgressProps {
  percentage: number;
}

export function ReadingProgressBar({ percentage }: ReadingProgressProps) {
  return (
    <div className="fixed top-16 left-0 right-0 z-40 h-1 bg-muted">
      <div
        className="h-full bg-primary transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
      />
    </div>
  );
}
