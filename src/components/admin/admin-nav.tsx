"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Library, Users, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/books", label: "Books", icon: Library },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-border/60 bg-card/30 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1 overflow-x-auto -mb-px">
          {links.map((link) => {
            const active = link.exact
              ? pathname === link.href
              : pathname === link.href || pathname.startsWith(`${link.href}/`);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "group relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {link.label}
                <span
                  className={cn(
                    "absolute inset-x-0 -bottom-px h-0.5 rounded-t-full transition-all",
                    active
                      ? "bg-primary opacity-100"
                      : "bg-primary opacity-0 group-hover:opacity-30"
                  )}
                />
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
