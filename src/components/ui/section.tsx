import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: "section" | "div" | "main" | "article";
  container?: boolean;
  containerClassName?: string;
  pad?: "sm" | "md" | "lg" | "xl";
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
    sm: "py-12 sm:py-16",
    md: "py-16 sm:py-20",
    lg: "py-20 sm:py-28",
    xl: "py-24 sm:py-32",
  }[pad];

  return (
    <Tag className={cn("relative px-4 sm:px-6 lg:px-8", padClass, className)} {...props}>
      {container ? (
        <div className={cn("mx-auto max-w-6xl", containerClassName)}>{children}</div>
      ) : (
        children
      )}
    </Tag>
  );
}

export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground",
        className
      )}
    >
      <span className="h-px w-6 bg-border" />
      {children}
    </div>
  );
}

export function SectionHeading({
  title,
  description,
  align = "center",
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-12 sm:mb-16",
        align === "center" ? "text-center max-w-2xl mx-auto" : "max-w-2xl",
        className
      )}
    >
      <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05]">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
