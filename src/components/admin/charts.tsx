"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const accentBg: Record<string, string> = {
  primary: "bg-primary",
  success: "bg-success",
  info: "bg-info",
  warning: "bg-warning",
  destructive: "bg-destructive",
};

export function TimelineChart({
  data,
  accent = "primary",
  labelInterval = 5,
}: {
  data: { label: string; value: number }[];
  accent?: keyof typeof accentBg;
  labelInterval?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="w-full">
      <div className="flex items-end gap-[2px] h-44 w-full">
        {data.map((d, i) => {
          const heightPct = (d.value / max) * 100;
          return (
            <div
              key={i}
              className="group flex-1 flex flex-col items-center justify-end min-w-0 h-full relative"
              title={`${d.label}: ${d.value}`}
            >
              <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold bg-foreground text-background px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-10">
                {d.value}
              </div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${heightPct}%` }}
                transition={{
                  duration: 0.7,
                  delay: Math.min(i * 0.015, 0.4),
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={cn(
                  "w-full rounded-t-sm min-h-[3px]",
                  accentBg[accent],
                  "opacity-80 group-hover:opacity-100 transition-opacity"
                )}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-[2px] mt-1.5 w-full">
        {data.map((d, i) => (
          <div
            key={i}
            className="flex-1 min-w-0 text-center text-[10px] text-muted-foreground/70"
          >
            {i % labelInterval === 0 || i === data.length - 1 ? d.label : ""}
          </div>
        ))}
      </div>
    </div>
  );
}

export function RankedList({
  items,
  accent = "primary",
  valueSuffix = "",
  formatValue,
}: {
  items: { label: string; sublabel?: string; value: number }[];
  accent?: keyof typeof accentBg;
  valueSuffix?: string;
  formatValue?: (v: number) => string;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const widthPct = (item.value / max) * 100;
        return (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-sm">
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{item.label}</p>
                {item.sublabel && (
                  <p className="text-xs text-muted-foreground truncate">{item.sublabel}</p>
                )}
              </div>
              <span className="text-sm font-semibold tabular-nums shrink-0">
                {formatValue ? formatValue(item.value) : `${item.value}${valueSuffix}`}
              </span>
            </div>
            <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${widthPct}%` }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.05,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={cn("h-full rounded-full", accentBg[accent])}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
