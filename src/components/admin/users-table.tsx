"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MoreHorizontal, Shield, User as UserIcon, Trash2, Users, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type SerializedUser = {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  image: string;
  createdAt: string;
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function UsersTable({
  users,
  currentUserId,
}: {
  users: SerializedUser[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SerializedUser | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    });
  }, [users, search, roleFilter]);

  async function changeRole(user: SerializedUser, role: "admin" | "user") {
    if (user.role === role) return;
    setBusyId(user._id);
    try {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update role");
      toast.success(`${user.name} is now ${role === "admin" ? "an admin" : "a member"}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setBusyId(deleteTarget._id);
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to delete user");
      toast.success(`Deleted ${deleteTarget.name}`);
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as typeof roleFilter)}>
          <SelectTrigger className="h-9 w-full sm:w-36">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
            <SelectItem value="user">Members</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description={
            search || roleFilter !== "all"
              ? "Try adjusting your search or filters"
              : "No users have signed up yet"
          }
          className="py-12"
        />
      ) : (
        <div className="divide-y divide-border/60 -mx-6">
          {filtered.map((user) => {
            const isSelf = user._id === currentUserId;
            const initials = getInitials(user.name);
            return (
              <div
                key={user._id}
                className="flex items-center gap-3 px-6 py-3.5 group hover:bg-muted/30 transition-colors"
              >
                <Avatar className="h-9 w-9 shrink-0">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground text-xs font-bold">
                      {initials || "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm truncate">{user.name}</p>
                    {isSelf && (
                      <Badge variant="soft" className="text-[10px] py-0">
                        You
                      </Badge>
                    )}
                    {user.role === "admin" && (
                      <Badge variant="soft" className="text-[10px] py-0 gap-1">
                        <Shield className="h-2.5 w-2.5" /> Admin
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span className="inline-flex items-center gap-1 truncate">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </span>
                    <span className="shrink-0">Joined {formatDate(user.createdAt)}</span>
                  </div>
                </div>
                <div className="shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={busyId === user._id}
                        aria-label="User actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        disabled={isSelf || busyId === user._id}
                        onClick={() => changeRole(user, user.role === "admin" ? "user" : "admin")}
                      >
                        {user.role === "admin" ? (
                          <>
                            <UserIcon className="h-4 w-4" /> Demote to member
                          </>
                        ) : (
                          <>
                            <Shield className="h-4 w-4" /> Promote to admin
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        disabled={isSelf || busyId === user._id}
                        onClick={() => setDeleteTarget(user)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" /> Delete account
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this account?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>&ldquo;{deleteTarget?.name}&rdquo;</strong>?
              This will permanently remove their account, reading progress, and bookmarks.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={busyId === deleteTarget?._id}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={busyId === deleteTarget?._id}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {busyId === deleteTarget?._id ? "Deleting..." : "Delete account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
