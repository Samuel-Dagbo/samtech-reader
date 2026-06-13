import * as React from "react";
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Logo({ className, iconClassName, showText = true, size = "md" }: LogoProps) {
  const sizes = {
    sm: { wrap: "h-7 w-7", icon: "h-3.5 w-3.5", text: "text-base", rounded: "rounded-lg" },
    md: { wrap: "h-9 w-9", icon: "h-4 w-4", text: "text-lg", rounded: "rounded-xl" },
    lg: { wrap: "h-11 w-11", icon: "h-5 w-5", text: "text-xl", rounded: "rounded-xl" },
    xl: { wrap: "h-14 w-14", icon: "h-6 w-6", text: "text-2xl", rounded: "rounded-2xl" },
  }[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center bg-gradient-to-br from-primary via-primary to-primary/70 shadow-md shadow-primary/25 ring-1 ring-white/10",
          sizes.wrap,
          sizes.rounded
        )}
      >
        <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-tr from-white/0 via-white/15 to-white/0" />
        <div className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_50%)]" />
        <BookOpen className={cn("relative text-primary-foreground drop-shadow-sm", sizes.icon, iconClassName)} strokeWidth={2.25} />
      </div>
      {showText && (
        <span className={cn("font-display font-semibold tracking-tight", sizes.text)}>
          SamTech <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Reader</span>
        </span>
      )}
    </div>
  );
}
