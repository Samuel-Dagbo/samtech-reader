import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionLabel } from "@/components/ui/section";
import { FadeUp } from "@/components/ui/motion";
import { StatCard } from "@/components/ui/stat-card";
import { UsersTable } from "@/components/admin/users-table";

export const metadata: Metadata = {
  title: "Users - SamTech Reader",
  description: "Manage platform users and their roles.",
};

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/");

  await dbConnect();

  const [users, totalAdmins] = await Promise.all([
    User.find()
      .select("name email role image createdAt")
      .sort({ createdAt: -1 })
      .lean(),
    User.countDocuments({ role: "admin" }),
  ]);

  const currentUserId = session.user.id;

  const serialized = users.map((u) => ({
    _id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role as "admin" | "user",
    image: u.image || "",
    createdAt:
      u.createdAt instanceof Date ? u.createdAt.toISOString() : String(u.createdAt),
  }));

  const totalUsers = serialized.length;
  const regularUsers = totalUsers - totalAdmins;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <FadeUp>
        <div className="mb-10">
          <SectionLabel>People</SectionLabel>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-balance">
            Users
          </h1>
          <p className="mt-2 text-muted-foreground">
            {totalUsers} {totalUsers === 1 ? "account" : "accounts"} on the platform
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.05}>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 mb-8">
          <StatCard label="Total users" value={totalUsers} icon={Users} accent="primary" />
          <StatCard label="Admins" value={totalAdmins} icon={Users} accent="warning" />
          <StatCard label="Members" value={regularUsers} icon={Users} accent="success" />
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <Card className="border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-3.5 w-3.5 text-primary" />
              </div>
              All accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UsersTable users={serialized} currentUserId={currentUserId} />
          </CardContent>
        </Card>
      </FadeUp>
    </div>
  );
}
