import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Book from "@/models/Book";
import { notFound } from "next/navigation";
import { EditBookForm } from "@/components/admin/edit-book-form";

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/");

  const { id } = await params;
  await dbConnect();
  const book = await Book.findById(id).lean();
  if (!book) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Book</h1>
        <p className="text-muted-foreground mt-1">Update book details</p>
      </div>
      <EditBookForm book={JSON.parse(JSON.stringify(book))} />
    </div>
  );
}
