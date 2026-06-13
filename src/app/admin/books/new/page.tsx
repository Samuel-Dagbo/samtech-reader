import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BookForm } from "@/components/admin/book-form";
import { SectionLabel } from "@/components/ui/section";
import { FadeUp } from "@/components/ui/motion";

export const dynamic = "force-dynamic";

export default async function NewBookPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/");

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <FadeUp>
        <div className="mb-8">
          <SectionLabel>Add to library</SectionLabel>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Upload a new book
          </h1>
          <p className="mt-2 text-muted-foreground">
            Upload a PDF — we&apos;ll automatically extract chapters and process it
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <BookForm />
      </FadeUp>
    </div>
  );
}
