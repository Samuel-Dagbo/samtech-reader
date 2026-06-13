import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account - SamTech Reader",
  description: "Create your SamTech Reader account and start reading books online.",
};

export default function RegisterPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 sm:py-16 overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute inset-0 section-shade" />
      <div className="floating-orb w-[26rem] h-[26rem] bottom-[-20%] right-[-10%] bg-primary/15 animate-pulse-glow" />
      <div
        className="floating-orb w-96 h-96 top-[-15%] left-[-10%] animate-pulse-glow"
        style={{ background: "oklch(0.6 0.22 235 / 0.12)" }}
      />
      <div className="relative">
        <RegisterForm />
      </div>
    </div>
  );
}
