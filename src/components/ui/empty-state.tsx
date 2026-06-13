"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  variant?: "default" | "dashed" | "solid";
}

export function EmptyState({ icon: Icon, title, description, action, className, variant = "default" }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "flex flex-col items-center justify-center px-6 py-16 sm:py-20 text-center rounded-2xl",
        variant === "dashed" && "border-2 border-dashed border-border/70 bg-muted/30",
        variant === "solid" && "border border-border/60 bg-card",
        variant === "default" && "border border-border/60 bg-card/50",
        className
      )}
    >
      {Icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/10 mb-5">
          <Icon className="h-7 w-7 text-primary" strokeWidth={1.75} />
        </div>
      )}
      <h3 className="font-display text-lg sm:text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 text-sm text-muted-foreground max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}
