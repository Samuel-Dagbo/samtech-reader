import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Mail, ArrowUpRight } from "lucide-react";

const linkSections = [
  {
    title: "Product",
    links: [
      { label: "Browse Books", href: "/books" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Bookmarks", href: "/dashboard/bookmarks" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign In", href: "/login" },
      { label: "Create Account", href: "/register" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Contact", href: "mailto:support@samtech.com" },
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border/60 bg-muted/30 mt-auto">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10">
          <div className="col-span-2 md:col-span-5">
            <Logo size="md" />
            <p className="mt-5 text-sm text-muted-foreground leading-relaxed max-w-sm">
              A modern cloud reading platform. Upload your books, read across any device,
              and never lose your place with auto-saving progress.
            </p>

            <div className="mt-6 flex items-center gap-2">
              <Link
                href="mailto:support@samtech.com"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-background/60 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-background/60 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                aria-label="X / Twitter"
              >
                <span className="text-sm font-bold">𝕏</span>
              </Link>
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-background/60 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                aria-label="GitHub"
              >
                <span className="text-sm font-bold">GH</span>
              </Link>
            </div>
          </div>

          {linkSections.map((section) => (
            <div key={section.title} className="md:col-span-2">
              <h3 className="text-sm font-semibold mb-4 text-foreground">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                      <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="md:col-span-1">
            <Link
              href="/register"
              className="group flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Start reading free
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            &copy; {year} SamTech Reader. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">Built with</span>
            <span className="px-1.5 py-0.5 rounded bg-background/60 border border-border/60">Next.js</span>
            <span className="px-1.5 py-0.5 rounded bg-background/60 border border-border/60">Cloudinary</span>
            <span className="px-1.5 py-0.5 rounded bg-background/60 border border-border/60">MongoDB</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
