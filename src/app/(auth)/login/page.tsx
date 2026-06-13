import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Quote, Shield, Zap, Star, Cloud } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In - SamTech Reader",
  description: "Sign in to your SamTech Reader account to continue reading.",
};

export default function LoginPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-[oklch(0.5_0.22_295)] text-primary-foreground">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="floating-orb w-[28rem] h-[28rem] -top-32 -left-32 bg-white/15 animate-pulse-glow" />
        <div
          className="floating-orb w-[24rem] h-[24rem] bottom-[-20%] right-[-15%] animate-pulse-glow"
          style={{ background: "oklch(0.6 0.18 235 / 0.3)", animationDelay: "1.5s" }}
        />
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          <Link href="/" className="inline-flex">
            <Logo size="md" />
          </Link>
          <div className="space-y-8 max-w-md">
            <Quote className="h-10 w-10 text-white/30" />
            <blockquote className="font-display text-2xl xl:text-3xl font-medium leading-[1.2] tracking-tight text-white/95 text-balance">
              &ldquo;I used to lose my place between my phone and laptop constantly. SamTech Reader
              made that problem disappear overnight.&rdquo;
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center font-semibold text-white">
                SC
              </div>
              <div>
                <p className="font-semibold text-white">Sarah Chen</p>
                <p className="text-sm text-white/70">Avid reader · 47 books this year</p>
              </div>
              <div className="ml-auto flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 max-w-md">
            {[
              { icon: Cloud, label: "Cloud sync" },
              { icon: Zap, label: "Real-time" },
              { icon: Shield, label: "Secure" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-2 text-sm text-white/85">
                <f.icon className="h-4 w-4" />
                {f.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16 relative">
        <div className="absolute inset-0 grid-pattern opacity-30 lg:hidden" />
        <div className="absolute inset-0 section-shade lg:hidden" />
        <div className="floating-orb w-[26rem] h-[26rem] top-[-20%] left-[-10%] bg-primary/15 animate-pulse-glow lg:hidden" />
        <div
          className="floating-orb w-96 h-96 bottom-[-15%] right-[-10%] animate-pulse-glow lg:hidden"
          style={{ background: "oklch(0.6 0.22 295 / 0.12)" }}
        />
        <div className="relative">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
