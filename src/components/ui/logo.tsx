import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, iconClassName, showText = true, size = "md" }: LogoProps) {
  const sizes = {
    sm: { wrap: "h-7 w-7", icon: "h-3.5 w-3.5", text: "text-base" },
    md: { wrap: "h-9 w-9", icon: "h-4 w-4", text: "text-lg" },
    lg: { wrap: "h-11 w-11", icon: "h-5 w-5", text: "text-xl" },
  }[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-md shadow-primary/25",
          sizes.wrap
        )}
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/0 via-white/10 to-white/0" />
        <BookOpen className={cn("relative text-primary-foreground", sizes.icon, iconClassName)} />
      </div>
      {showText && (
        <span className={cn("font-display font-semibold tracking-tight", sizes.text)}>
          SamTech <span className="text-primary">Reader</span>
        </span>
      )}
    </div>
  );
}
