import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BookForm } from "@/components/admin/book-form";
import { SectionLabel } from "@/components/ui/section";
import { FadeUp } from "@/components/ui/motion";
import { FileText, Sparkles, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewBookPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/");

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <FadeUp>
        <div className="mb-10">
          <SectionLabel>Add to library</SectionLabel>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-balance">
            Upload a new book
          </h1>
          <p className="mt-2 text-muted-foreground">
            Upload a PDF — we&apos;ll automatically extract chapters and process it
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          {[
            { icon: FileText, title: "Upload PDF", desc: "Drag and drop or click to select" },
            { icon: Sparkles, title: "Auto chapters", desc: "We split into chapters automatically" },
            { icon: Zap, title: "Go live", desc: "Available in the library instantly" },
          ].map((step) => (
            <div key={step.title} className="flex items-start gap-3 p-4 rounded-xl border border-border/60 bg-card/50">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <step.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">{step.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </FadeUp>

      <FadeUp delay={0.15}>
        <BookForm />
      </FadeUp>
    </div>
  );
}
