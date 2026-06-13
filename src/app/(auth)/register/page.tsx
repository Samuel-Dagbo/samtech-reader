import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Shield, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Create Account - SamTech Reader",
  description: "Create your SamTech Reader account and start reading books online.",
};

export default function RegisterPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[oklch(0.5_0.22_295)] via-primary/95 to-primary text-primary-foreground">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="floating-orb w-[28rem] h-[28rem] -bottom-32 -right-32 bg-white/15 animate-pulse-glow" />
        <div
          className="floating-orb w-[24rem] h-[24rem] top-[-20%] left-[-15%] animate-pulse-glow"
          style={{ background: "oklch(0.6 0.18 235 / 0.3)", animationDelay: "1.5s" }}
        />
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          <Link href="/" className="inline-flex">
            <Logo size="md" />
          </Link>
          <div className="space-y-8 max-w-md">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              <Sparkles className="h-3 w-3" />
              Join 5,000+ readers
            </div>
            <h2 className="font-display text-3xl xl:text-4xl font-semibold leading-[1.1] tracking-tight text-white text-balance">
              Your next great read is waiting in the cloud.
            </h2>
            <p className="text-white/80 text-lg leading-relaxed">
              Create your free account in seconds. Upload PDFs, read across every device,
              and never lose your place.
            </p>
            <ul className="space-y-3">
              {[
                "Unlimited book uploads with auto chapter splitting",
                "Real-time cloud sync across all your devices",
                "Smart bookmarks, highlights, and reading insights",
              ].map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 text-sm text-white/90">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 mt-0.5 shrink-0">
                    <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center gap-3 text-xs text-white/70">
            <Shield className="h-3.5 w-3.5" />
            <span>Free forever · No credit card · Cancel anytime</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16 relative">
        <div className="absolute inset-0 grid-pattern opacity-30 lg:hidden" />
        <div className="absolute inset-0 section-shade lg:hidden" />
        <div className="floating-orb w-[26rem] h-[26rem] bottom-[-20%] right-[-10%] bg-primary/15 animate-pulse-glow lg:hidden" />
        <div
          className="floating-orb w-96 h-96 top-[-15%] left-[-10%] animate-pulse-glow lg:hidden"
          style={{ background: "oklch(0.6 0.22 235 / 0.12)" }}
        />
        <div className="relative">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
