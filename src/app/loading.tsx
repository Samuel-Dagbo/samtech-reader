import { BookOpen, Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="relative">
        <BookOpen className="h-12 w-12 text-primary/20" />
        <Loader2 className="h-6 w-6 text-primary animate-spin absolute -top-1 -right-1" />
      </div>
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );
}
