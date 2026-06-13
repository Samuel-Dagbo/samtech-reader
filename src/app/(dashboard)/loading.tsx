import { Logo } from "@/components/ui/logo";

export default function DashboardLoading() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[60vh] gap-5">
      <div className="relative">
        <Logo size="md" showText={false} />
        <div className="absolute -inset-3 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      </div>
      <p className="text-sm text-muted-foreground">Loading your dashboard…</p>
    </div>
  );
}
