"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { useAdminTickets } from "@/lib/store/admin-ticket-store";
import type { Ticket } from "@/lib/types/ticket";

export default function AdminNewTicketPage() {
  const { addTicket } = useAdminTickets();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High" | "Urgent">("Medium");
  const [status, setStatus] = useState<"To Do" | "In Progress" | "In Review" | "Done" | "Closed">("To Do");
  const [assignee, setAssignee] = useState("Adit");

  const submit = () => {
    if (!title.trim() || !description.trim()) return;

    const newTicket: Ticket = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      type: "Task",
      assignee,
      reporter: "Admin",
      labels: ["Frontend"],
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
      comments: [{
        id: `c-${Date.now()}`,
        author: "Admin",
        role: "Admin",
        message: "Ticket dibuat dari form admin mock.",
        createdAt: new Date().toISOString(),
      }],
      attachments: [],
      activity: [{
        id: `ac-${Date.now()}`,
        from: "New",
        to: status,
        by: "Admin",
        at: new Date().toISOString(),
      }],
    };

    addTicket(newTicket);
    router.push("/admin/tickets");
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Create</p>
          <h1 className="text-2xl font-semibold text-foreground">Ticket Baru</h1>
        </div>
        <Link href="/admin/tickets" className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground">
          <ArrowLeft className="size-4" />
          Back
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm text-foreground">Judul</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-foreground outline-none focus:border-primary" placeholder="Masukkan judul tiket" />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm text-foreground">Deskripsi</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[140px] w-full rounded-xl border border-input bg-background px-3 py-2.5 text-foreground outline-none focus:border-primary" placeholder="Deskripsikan masalahnya..." />
        </label>

        <label className="space-y-2">
          <span className="text-sm text-foreground">Priority</span>
          <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-foreground">
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm text-foreground">Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-foreground">
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Done">Done</option>
            <option value="Closed">Closed</option>
          </select>
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm text-foreground">Assignee</span>
          <input value={assignee} onChange={(e) => setAssignee(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-foreground outline-none focus:border-primary" />
        </label>
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={submit} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
          <Plus className="size-4" />
          Simpan Ticket
        </button>
      </div>
    </div>
  );
}
