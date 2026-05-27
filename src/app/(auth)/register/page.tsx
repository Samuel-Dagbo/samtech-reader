import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account - SamTech Reader",
  description: "Create your SamTech Reader account and start reading books online.",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <RegisterForm />
    </div>
  );
}
