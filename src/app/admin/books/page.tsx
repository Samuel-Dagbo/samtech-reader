import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Book from "@/models/Book";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, BookOpen } from "lucide-react";
import { DeleteBookButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function AdminBooksPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/");

  await dbConnect();
  const books = await Book.find().sort({ createdAt: -1 }).lean();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Manage Books</h1>
          <p className="text-muted-foreground mt-1">{books.length} book(s) in the library</p>
        </div>
        <Link href="/admin/books/new">
          <Button className="gap-2"><Plus className="h-4 w-4" /> Add Book</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Books</CardTitle>
        </CardHeader>
        <CardContent>
          {books.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No books yet. Upload your first book!</p>
          ) : (
            <div className="space-y-3">
              {books.map((book) => (
                <div key={book._id.toString()} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-12 w-9 rounded bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                      {book.coverImage ? (
                        <img src={book.coverImage} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{book.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {book.author} &middot; {book.totalChapters} ch &middot; {book.readingTime} min
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:shrink-0">
                    <Link href={`/admin/books/${book._id}/edit`}>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Pencil className="h-4 w-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                    </Link>
                    <DeleteBookButton bookId={book._id.toString()} title={book.title} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
