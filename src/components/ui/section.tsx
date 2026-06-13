import * as React from "react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: "section" | "div" | "main" | "article";
  container?: boolean;
  containerClassName?: string;
  pad?: "sm" | "md" | "lg" | "xl" | "none";
  children: ReactNode;
}

export function Section({
  as: Tag = "section",
  container = true,
  containerClassName,
  pad = "lg",
  className,
  children,
  ...props
}: SectionProps) {
  const padClass = {
    none: "",
    sm: "py-12 sm:py-16",
    md: "py-16 sm:py-20",
    lg: "py-20 sm:py-28",
    xl: "py-24 sm:py-32",
  }[pad];

  return (
    <Tag className={cn("relative px-4 sm:px-6 lg:px-8", padClass, className)} {...props}>
      {container ? (
        <div className={cn("mx-auto max-w-7xl", containerClassName)}>{children}</div>
      ) : (
        children
      )}
    </Tag>
  );
}

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary",
        className
      )}
    >
      <span className="h-px w-6 bg-gradient-to-r from-primary to-primary/30" />
      {children}
    </div>
  );
}

export function SectionHeading({
  title,
  description,
  align = "center",
  className,
  eyebrow,
}: {
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  className?: string;
  eyebrow?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mb-12 sm:mb-16",
        align === "center" ? "text-center max-w-2xl mx-auto" : "max-w-2xl",
        className
      )}
    >
      {eyebrow && <div className="mb-4">{eyebrow}</div>}
      <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05] text-balance">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed text-pretty">
          {description}
        </p>
      )}
    </div>
  );
}
