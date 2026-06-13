import type { Metadata } from "next";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SamTech Reader — Cloud Reading Platform",
    template: "%s | SamTech Reader",
  },
  description: "A modern cloud reading platform. Upload your books, read across any device, and never lose your place with auto-saving progress.",
  keywords: ["ebook reader", "cloud library", "online reading", "pdf reader", "bookmarks", "reading progress"],
  openGraph: {
    title: "SamTech Reader — Cloud Reading Platform",
    description: "A modern cloud reading platform. Read anywhere, never lose your page.",
    type: "website",
    siteName: "SamTech Reader",
  },
  twitter: {
    card: "summary_large_image",
    title: "SamTech Reader — Cloud Reading Platform",
    description: "A modern cloud reading platform. Read anywhere, never lose your page.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${fraunces.variable} ${jetbrains.variable}`}
    >
      <body className={inter.className}>
        <Providers>
          <div className="flex min-h-screen flex-col bg-background noise">
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
