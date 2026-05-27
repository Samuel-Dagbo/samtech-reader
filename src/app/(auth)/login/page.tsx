import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In - SamTech Reader",
  description: "Sign in to your SamTech Reader account to continue reading.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <LoginForm />
    </div>
  );
}
