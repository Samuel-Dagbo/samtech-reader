import { Logo } from "@/components/ui/logo";
import { BookOpen } from "lucide-react";

export default function Loading() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[60vh] gap-5">
      <div className="absolute inset-0 section-shade" />
      <div className="floating-orb w-96 h-96 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary/10 animate-pulse-glow" />
      <div className="relative">
        <Logo size="lg" showText={false} />
        <div className="absolute -inset-3 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
        <BookOpen className="h-4 w-4" />
        Loading your library…
      </div>
    </div>
  );
}
