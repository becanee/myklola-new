"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Calendar, Paperclip, Send } from "lucide-react";
import { useAdminTickets } from "@/lib/store/admin-ticket-store";

export default function AdminTicketDetailPage() {
  const params = useParams<{ id: string }>();
  const {
    tickets,
    updateTicketStatus,
    addTicketComment,
    addTicketAttachments,
  } = useAdminTickets();
  const ticket = tickets.find((item) => item.id === params.id);
  const [reply, setReply] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const submitReply = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = reply.trim();
    if (!message && files.length === 0) return;

    const now = new Date().toISOString();
    if (message) {
      addTicketComment(ticket?.id ?? "", {
        id: `comment-${Date.now()}`,
        author: "Admin",
        role: "Admin",
        message,
        createdAt: now,
      });
    }

    if (files.length > 0) {
      addTicketAttachments(
        ticket?.id ?? "",
        files.map((file, index) => ({
          id: `attachment-${Date.now()}-${index}`,
          name: file.name,
          type: file.type || "application/octet-stream",
          size: `${Math.max(file.size / 1024, 1).toFixed(0)} KB`,
          url: URL.createObjectURL(file),
        })),
      );
    }

    setReply("");
    setFiles([]);
  };

  if (!ticket) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
        Ticket tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/tickets" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground">
          <ArrowLeft className="size-4" />
          Kembali
        </Link>

        <select
          value={ticket.status}
          onChange={(e) => updateTicketStatus(ticket.id, e.target.value as any)}
          className="rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground"
        >
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="In Review">In Review</option>
          <option value="Done">Done</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm text-primary">{ticket.id}</p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground">{ticket.title}</h1>
          </div>
          <div className="flex gap-2">
            <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">{ticket.priority}</span>
            <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">{ticket.type}</span>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl bg-background p-3">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Assignee</p>
            <p className="mt-2 text-sm font-medium text-foreground">{ticket.assignee}</p>
          </div>
          <div className="rounded-xl bg-background p-3">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Reporter</p>
            <p className="mt-2 text-sm font-medium text-foreground">{ticket.reporter}</p>
          </div>
          <div className="rounded-xl bg-background p-3">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Due Date</p>
            <p className="mt-2 text-sm font-medium text-foreground">{new Date(ticket.dueDate).toLocaleDateString("id-ID")}</p>
          </div>
          <div className="rounded-xl bg-background p-3">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Status</p>
            <p className="mt-2 text-sm font-medium text-foreground">{ticket.status}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-5">
            <div className="rounded-xl bg-background p-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">Description</h2>
              <p className="mt-3 text-sm leading-7 text-foreground">{ticket.description}</p>
            </div>

            <div className="rounded-xl bg-background p-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">Comments</h2>
              <div className="mt-4 space-y-3">
                {ticket.comments.map((comment) => (
                  <div key={comment.id} className="rounded-xl border border-border bg-card p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span className="font-medium text-foreground">{comment.author}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{comment.role}</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">{new Date(comment.createdAt).toLocaleString("id-ID")}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{comment.message}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={submitReply} className="mt-5 border-t border-border pt-4">
                <label htmlFor="ticket-reply" className="text-sm font-medium text-foreground">
                  Reply to user
                </label>
                <textarea
                  id="ticket-reply"
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder="Tulis update atau solusi untuk user..."
                  className="mt-2 min-h-28 w-full resize-y rounded-xl border border-input bg-card px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                />
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <Paperclip className="size-4" />
                    <span>{files.length > 0 ? `${files.length} file dipilih` : "Lampirkan bukti"}</span>
                    <input
                      type="file"
                      multiple
                      onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
                      className="sr-only"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={!reply.trim() && files.length === 0}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="size-4" />
                    Kirim Reply
                  </button>
                </div>
                {files.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {files.map((file) => (
                      <span key={`${file.name}-${file.lastModified}`} className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                        {file.name}
                      </span>
                    ))}
                  </div>
                )}
              </form>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-xl bg-background p-4">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                <Paperclip className="size-4" />
                Attachments
              </div>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                {ticket.attachments.length > 0 ? ticket.attachments.map((file) => (
                  <div key={file.id} className="rounded-lg border border-border bg-card p-2">
                    {file.url ? (
                      <a href={file.url} download={file.name} className="font-medium text-primary hover:underline">
                        {file.name}
                      </a>
                    ) : (
                      <span className="font-medium text-foreground">{file.name}</span>
                    )}{" "}
                    <span className="text-muted-foreground">({file.size})</span>
                  </div>
                )) : <p className="text-muted-foreground">Tidak ada attachment</p>}
              </div>
            </div>

            <div className="rounded-xl bg-background p-4">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                <Calendar className="size-4" />
                Activity
              </div>
              <div className="mt-3 space-y-3">
                {ticket.activity.map((item) => (
                  <div key={item.id} className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{item.by}</span> changed {item.from} → {item.to}
                    <div className="mt-1 text-[11px] text-muted-foreground">{new Date(item.at).toLocaleString("id-ID")}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
