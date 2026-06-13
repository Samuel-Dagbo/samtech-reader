"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import toast from "react-hot-toast";
import { Loader2, ArrowRight, Mail, Lock, User, Check, Shield } from "lucide-react";

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      toast.success("Account created! Please sign in.");
      router.push("/login");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-8"
      >
        <div className="inline-flex mb-6">
          <Logo size="lg" showText={false} />
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
          Start reading free
        </h1>
        <p className="mt-2 text-muted-foreground">
          Create your account in seconds
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card className="relative overflow-hidden border-border/60 shadow-xl shadow-black/[0.03] dark:shadow-black/30">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <CardContent className="p-7">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm">Full name</Label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    required
                    className="h-11 pl-10"
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    className="h-11 pl-10"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    className="h-11 pl-10"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <ul className="text-xs text-muted-foreground space-y-2 pt-1">
                {[
                  "Unlimited book uploads",
                  "Sync across all your devices",
                  "Smart bookmarks and highlights",
                ].map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2.5">
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/15">
                      <Check className="h-2.5 w-2.5 text-primary" strokeWidth={3} />
                    </div>
                    {benefit}
                  </li>
                ))}
              </ul>

              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="w-full shadow-lg shadow-primary/25"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Sign in
          </Link>
        </p>

        <div className="mt-8 flex items-center gap-2 justify-center text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5 text-primary" />
          <span>Free forever. No credit card required.</span>
        </div>
      </motion.div>
    </div>
  );
}
