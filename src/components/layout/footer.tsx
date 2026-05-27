import Link from "next/link";
import { BookOpen, BookMarked, Mail } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <span className="text-lg font-bold tracking-tight">SamTech Reader</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-6">
              A modern cloud reading platform. Upload your books, read across any device,
              and never lose your place with auto-saving progress.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {["A", "B", "C"].map((letter, i) => (
                  <div
                    key={i}
                    className="h-7 w-7 rounded-full border-2 border-background bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-[9px] font-semibold text-primary"
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                5,000+ readers
              </span>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-foreground">Product</h3>
            <ul className="space-y-3">
              <li><Link href="/books" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Browse Books</Link></li>
              <li><Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link></li>
              <li><Link href="/dashboard/bookmarks" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Bookmarks</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-foreground">Support</h3>
            <ul className="space-y-3">
              <li><Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Create Account</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-foreground">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                support@samtech.com
              </li>
              <li className="text-sm text-muted-foreground">
                SamTech Inc.
              </li>
            </ul>
            <div className="mt-6">
              <Link href="/register">
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                  <BookMarked className="h-3.5 w-3.5" />
                  Start Reading Free
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {year} SamTech Reader. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Built with Next.js</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>Cloudinary</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>MongoDB</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
