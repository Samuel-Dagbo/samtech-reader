import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BookForm } from "@/components/admin/book-form";

export default async function NewBookPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/");

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Upload New Book</h1>
        <p className="text-muted-foreground mt-1">Upload a PDF and our system will automatically process it</p>
      </div>
      <BookForm />
    </div>
  );
}
