"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Search, UserPlus, UsersRound } from "lucide-react";
import { Table, type TableColumn } from "@/components/motion/table";
import { mockAdminUsers } from "@/lib/mock-data/users";
import type { AdminUser, AdminUserStatus } from "@/lib/types/admin-user";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const statusOptions: Array<"all" | AdminUserStatus> = ["all", "Active", "Inactive"];

const userColumns: TableColumn<AdminUser>[] = [
  {
    key: "name",
    header: "User",
    sortable: true,
    width: "1.5fr",
    cell: (user) => (
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">{user.name}</p>
        <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
      </div>
    ),
  },
  {
    key: "email",
    header: "Email",
    sortable: true,
    width: "1.4fr",
    cell: (user) => <span className="text-muted-foreground">{user.email}</span>,
  },
  {
    key: "department",
    header: "Department",
    sortable: true,
    width: "1.1fr",
    cell: (user) => <span className="text-muted-foreground">{user.department}</span>,
  },
  {
    key: "position",
    header: "Position",
    width: "1.2fr",
    cell: (user) => <span className="text-muted-foreground">{user.position}</span>,
  },
  {
    key: "roles",
    header: "Role",
    width: "130px",
    cell: (user) => (
      <div className="flex flex-wrap gap-1">
        {user.roles.map((role) => (
          <span key={role} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
            {role}
          </span>
        ))}
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    width: "110px",
    cell: (user) => (
      <span className={user.status === "Active" ? "rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700" : "rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"}>
        {user.status}
      </span>
    ),
  },
  {
    key: "lastLogin",
    header: "Last Login",
    sortable: true,
    align: "right",
    width: "130px",
    cell: (user) => (
      <span className="text-xs tabular-nums text-muted-foreground">
        {new Date(user.lastLogin).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
      </span>
    ),
  },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(mockAdminUsers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | AdminUserStatus>("all");
  const [role, setRole] = useState("all");
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    department: "",
    position: "",
    role: "Customer",
    status: "Active" as AdminUserStatus,
  });

  const roles = Array.from(new Set(users.flatMap((user) => user.roles)));
  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch = !query || [user.name, user.username, user.email, user.department].some((value) => value.toLowerCase().includes(query));
      const matchesStatus = status === "all" || user.status === status;
      const matchesRole = role === "all" || user.roles.includes(role);
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [role, search, status, users]);

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const addUser = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.username.trim() || !form.email.trim() || !form.department.trim() || !form.position.trim()) return;

    setUsers((current) => [
      {
        id: `USR-${Date.now()}`,
        name: form.name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        department: form.department.trim(),
        position: form.position.trim(),
        roles: [form.role],
        status: form.status,
        lastLogin: new Date().toISOString(),
      },
      ...current,
    ]);
    setForm({ name: "", username: "", email: "", department: "", position: "", role: "Customer", status: "Active" });
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Management</p>
          <h1 className="text-2xl font-semibold text-foreground">Users</h1>
        </div>
        <button type="button" onClick={() => setDialogOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
          <UserPlus className="size-4" />
          Add User
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-background p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground"><span>Total Users</span><UsersRound className="size-4" /></div>
          <p className="mt-2 text-2xl font-semibold text-foreground">{users.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-sm text-muted-foreground">Active Users</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{users.filter((user) => user.status === "Active").length}</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-sm text-muted-foreground">Agents & Admins</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{users.filter((user) => user.roles.some((item) => item === "Admin" || item === "Agent")).length}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background p-4">
        <div className="grid gap-3 lg:grid-cols-[1.6fr_180px_180px]">
          <label className="flex items-center gap-2 rounded-lg border border-input bg-card px-3 py-2 text-sm text-muted-foreground">
            <Search className="size-4" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search user..." className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground" />
          </label>
          <select value={status} onChange={(event) => setStatus(event.target.value as "all" | AdminUserStatus)} className="rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground">
            {statusOptions.map((item) => <option key={item} value={item}>{item === "all" ? "All Status" : item}</option>)}
          </select>
          <select value={role} onChange={(event) => setRole(event.target.value)} className="rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground">
            <option value="all">All Roles</option>
            {roles.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background p-3">
        <div className="mb-2 flex items-center justify-between px-1 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">All Users</span>
          <span>{filteredUsers.length} users</span>
        </div>
        <Table data={filteredUsers} columns={userColumns} getRowId={(user) => user.id} resizable reorderable defaultSort={{ key: "name", direction: "asc" }} height={440} rowHeight={56} emptyState="No users found" className="rounded-xl border border-border/50" />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
            <DialogDescription>Create a user account for the support portal.</DialogDescription>
          </DialogHeader>

          <form onSubmit={addUser} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {(["name", "username", "email", "department", "position"] as const).map((field) => (
                <label key={field} className={field === "email" ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"}>
                  <span className="text-sm font-medium text-foreground">{field === "name" ? "Full Name" : field.charAt(0).toUpperCase() + field.slice(1)}</span>
                  <input
                    required
                    type={field === "email" ? "email" : "text"}
                    value={form[field]}
                    onChange={(event) => updateForm(field, event.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  />
                </label>
              ))}
              <label className="space-y-1.5">
                <span className="text-sm font-medium text-foreground">Role</span>
                <select value={form.role} onChange={(event) => updateForm("role", event.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground">
                  <option>Customer</option>
                  <option>Agent</option>
                  <option>Admin</option>
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-medium text-foreground">Status</span>
                <select value={form.status} onChange={(event) => updateForm("status", event.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
            </div>
            <DialogFooter>
              <button type="button" onClick={() => setDialogOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-muted">Cancel</button>
              <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Create User</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
