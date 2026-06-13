import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  trend?: { value: string; positive?: boolean };
  accent?: "primary" | "success" | "warning" | "destructive" | "info";
  className?: string;
}

const accentMap = {
  primary: {
    icon: "bg-primary/10 text-primary",
    ring: "ring-primary/20",
    glow: "from-primary/10 via-transparent to-transparent",
  },
  success: {
    icon: "bg-success/10 text-success",
    ring: "ring-success/20",
    glow: "from-success/10 via-transparent to-transparent",
  },
  warning: {
    icon: "bg-warning/15 text-warning",
    ring: "ring-warning/20",
    glow: "from-warning/10 via-transparent to-transparent",
  },
  destructive: {
    icon: "bg-destructive/10 text-destructive",
    ring: "ring-destructive/20",
    glow: "from-destructive/10 via-transparent to-transparent",
  },
  info: {
    icon: "bg-brand-400/10 text-brand-400",
    ring: "ring-brand-400/20",
    glow: "from-brand-400/10 via-transparent to-transparent",
  },
};

export function StatCard({ label, value, icon: Icon, trend, accent = "primary", className }: StatCardProps) {
  const a = accentMap[accent];

  return (
    <Card className={cn("group relative overflow-hidden hover-lift", className)}>
      <div className={cn("pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br opacity-60 blur-2xl transition-opacity group-hover:opacity-100", a.glow)} />
      <CardContent className="relative p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 font-display text-3xl font-semibold tracking-tight">
              {value}
            </p>
            {trend && (
              <p
                className={cn(
                  "mt-1 text-xs font-medium",
                  trend.positive ? "text-success" : "text-destructive"
                )}
              >
                {trend.positive ? "↑" : "↓"} {trend.value}
              </p>
            )}
          </div>
          {Icon && (
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl ring-1", a.icon, a.ring)}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
