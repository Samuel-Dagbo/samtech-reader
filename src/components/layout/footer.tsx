import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">SamTech Reader</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-md">
              A modern cloud reading platform. Read anywhere, pick up where you left off.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Links</h3>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/books" className="hover:text-foreground transition-colors">Browse Books</Link>
              <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Contact</h3>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span>support@samtech.com</span>
              <span>SamTech Inc.</span>
            </div>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} SamTech Reader. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
