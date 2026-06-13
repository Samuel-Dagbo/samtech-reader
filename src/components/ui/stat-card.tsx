import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  trend?: { value: string; positive?: boolean };
  accent?: "primary" | "success" | "warning" | "destructive" | "info";
  description?: string;
  className?: string;
}

const accentMap = {
  primary: {
    icon: "bg-primary/10 text-primary",
    ring: "ring-primary/20",
    glow: "from-primary/20 via-primary/5 to-transparent",
    text: "text-primary",
  },
  success: {
    icon: "bg-success/10 text-success",
    ring: "ring-success/20",
    glow: "from-success/20 via-success/5 to-transparent",
    text: "text-success",
  },
  warning: {
    icon: "bg-warning/15 text-warning",
    ring: "ring-warning/20",
    glow: "from-warning/20 via-warning/5 to-transparent",
    text: "text-warning",
  },
  destructive: {
    icon: "bg-destructive/10 text-destructive",
    ring: "ring-destructive/20",
    glow: "from-destructive/20 via-destructive/5 to-transparent",
    text: "text-destructive",
  },
  info: {
    icon: "bg-info/10 text-info",
    ring: "ring-info/20",
    glow: "from-info/20 via-info/5 to-transparent",
    text: "text-info",
  },
};

export function StatCard({ label, value, icon: Icon, trend, accent = "primary", description, className }: StatCardProps) {
  const a = accentMap[accent];

  return (
    <Card className={cn("group relative overflow-hidden hover-lift border-border/60", className)}>
      <div className={cn("pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-100", a.glow)} />
      <CardContent className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="mt-2.5 font-display text-3xl font-semibold tracking-tight">
              {value}
            </p>
            {(trend || description) && (
              <div className="mt-2 flex items-center gap-1.5">
                {trend && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 text-xs font-semibold",
                      trend.positive ? "text-success" : "text-destructive"
                    )}
                  >
                    {trend.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {trend.value}
                  </span>
                )}
                {description && (
                  <span className="text-xs text-muted-foreground">{description}</span>
                )}
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-500 group-hover:scale-110", a.icon, a.ring)}>
              <Icon className="h-5 w-5" strokeWidth={2} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
