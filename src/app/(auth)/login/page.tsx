import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In - SamTech Reader",
  description: "Sign in to your SamTech Reader account to continue reading.",
};

export default function LoginPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 sm:py-16 overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute inset-0 section-shade" />
      <div className="floating-orb w-[26rem] h-[26rem] top-[-20%] left-[-10%] bg-primary/15 animate-pulse-glow" />
      <div
        className="floating-orb w-96 h-96 bottom-[-15%] right-[-10%] animate-pulse-glow"
        style={{ background: "oklch(0.6 0.22 295 / 0.12)" }}
      />
      <div className="relative">
        <LoginForm />
      </div>
    </div>
  );
}
