"use client";

import HeaderComp from "@/components/header-comp";
import { ArrowLeft, Send, Download, Paperclip, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DescriptionRenderer from "./description";

/* ─── Types ─── */

interface CreatedBy {
  id: number;
  name: string;
  email: string;
}

interface TicketData {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  assign_to: string | null;
  description: string | null;
  attachments: unknown[] | null;
  created_at: string;
  updated_at: string | null;
  created_by: CreatedBy | null;
}

/* ─── Style maps ─── */

const PRIORITY_STYLES: Record<string, string> = {
  Low: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400",
  Medium:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400",
  High: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400",
  Urgent:
    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400",
};

const STATUS_STYLES: Record<string, string> = {
  Open: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Pending: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  "Action Required": "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  Investigate: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  Resolved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Closed: "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400",
};

/* ─── Timeline ─── */

const ALL_STEPS = [
  { label: "Submitted", description: "Ticket has been created" },
  { label: "Pending", description: "Awaiting initial review" },
  { label: "Action Required", description: "Additional information needed" },
  { label: "Investigate", description: "Under investigation by the team" },
  { label: "Resolved / Closed", description: "Ticket has been resolved" },
] as const;

const STATUS_INDEX: Record<string, number> = {
  Open: 0,
  Pending: 1,
  "Action Required": 2,
  Investigate: 3,
  Resolved: 4,
  Closed: 4,
};

function TimelineSection({ status }: { status: string }) {
  const currentIdx = STATUS_INDEX[status] ?? 0;

  const timeline = useMemo(
    () =>
      ALL_STEPS.map((step, i) => ({
        ...step,
        phase: (i < currentIdx
          ? "done"
          : i === currentIdx
            ? "current"
            : "upcoming") as "done" | "current" | "upcoming",
      })),
    [currentIdx],
  );

  return (
    <div className="space-y-0">
      {timeline.map((step, i) => (
        <div key={step.label} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "size-2.5 rounded-full shrink-0 mt-1",
                step.phase === "done" && "bg-emerald-500",
                step.phase === "current" &&
                  "bg-[#0B3464] ring-2 ring-[#0B3464]/20",
                step.phase === "upcoming" && "bg-border",
              )}
            />
            {i < timeline.length - 1 && (
              <div
                className={cn(
                  "mt-1 w-px flex-1 min-h-[28px]",
                  step.phase === "done" ? "bg-emerald-500/30" : "bg-border",
                )}
              />
            )}
          </div>

          <div className={cn("pb-6", i === timeline.length - 1 && "pb-0")}>
            <p
              className={cn(
                "text-sm leading-tight",
                step.phase === "upcoming" && "text-muted-foreground/40",
                step.phase === "done" &&
                  "text-muted-foreground/70 line-through decoration-1 decoration-muted-foreground/20",
                step.phase === "current" && "font-medium text-foreground",
              )}
            >
              {step.label}
            </p>
            {step.description && (
              <p
                className={cn(
                  "mt-0.5 text-xs leading-relaxed",
                  step.phase === "upcoming" && "text-muted-foreground/30",
                  step.phase === "done" && "text-muted-foreground/50",
                  step.phase === "current" && "text-muted-foreground/70",
                )}
              >
                {step.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Meta item ─── */

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="mt-0.5 text-sm text-foreground">{value}</p>
    </div>
  );
}

/* ─── Attachment helpers ─── */

interface AttachmentItem {
  url: string;
  key: string;
  name: string;
  size: number;
}

function isImage(name: string): boolean {
  const ext = "." + name.split(".").pop()?.toLowerCase();
  return [".png", ".jpg", ".jpeg", ".webp", ".svg"].includes(ext);
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Convert R2 key path to API proxy URL */
function proxyUrl(key: string): string {
  return `/api/v1/attachments/${key}`;
}

function AttachmentSection({ attachments }: { attachments: unknown[] }) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const items = attachments as AttachmentItem[];

  return (
    <>
      <div>
        <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Paperclip className="size-3.5" />
          Attachments ({items.length})
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {items.map((file) =>
            isImage(file.name) ? (
              <button
                key={file.key}
                type="button"
                onClick={() => setLightboxUrl(proxyUrl(file.url))}
                className="group relative aspect-video overflow-hidden rounded-lg border border-border/40 bg-muted transition-all hover:border-border/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <img
                  src={proxyUrl(file.url)}
                  alt={file.name}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-2 pt-6">
                  <p className="truncate text-[11px] text-white">{file.name}</p>
                </div>
              </button>
            ) : (
              <a
                key={file.key}
                href={file.url}
                download={file.name}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/30 p-3 transition-all hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-border/40 text-base">
                  📄
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatSize(file.size)}
                  </p>
                </div>
                <Download className="size-4 shrink-0 text-muted-foreground" />
              </a>
            ),
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="size-5" />
          </button>
          <img
            src={lightboxUrl}
            alt="Preview"
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

/* ─── Main module ─── */

export default function AdminTicketDetailModule({ ticketId }: { ticketId: string }) {
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/v1/tickets/${ticketId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) setTicket(json.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [ticketId]);

  const formattedCreated = ticket?.created_at
    ? new Date(ticket.created_at).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

  const formattedUpdated = ticket?.updated_at
    ? new Date(ticket.updated_at).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  if (!ticket && !loading) {
    return (
      <div className="w-full min-h-screen flex flex-col">
        <HeaderComp
          title="Ticket Detail"
          path="Management > Tickets"
        />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Ticket tidak ditemukan.{" "}
            <Link href="/admin/tickets" className="text-primary hover:underline">
              Kembali
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (loading || !ticket) {
    return (
      <div className="w-full min-h-screen flex flex-col">
        <HeaderComp
          title="Ticket Detail"
          path={`Management > Tickets > ${ticketId}`}
        />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-muted-foreground">Memuat tiket...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col">
      <HeaderComp
        title="Ticket Detail"
        path={`Management > Tickets > ${ticketId}`}
      />

      <div className="flex flex-1 flex-col p-2 -mt-14">
        <div className="mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* ─── Left: Detail info ─── */}
          <div className="lg:col-span-2 p-6 rounded-lg border border-border/40 bg-card space-y-8">
            {/* Back + badges */}
            <div className="flex items-center justify-between">
              <Link
                href="/admin/tickets"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="size-4" />
                Tickets
              </Link>

              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "rounded-md border px-2 py-0.5 text-[11px] font-medium",
                    PRIORITY_STYLES[ticket.priority] ??
                      "bg-muted text-muted-foreground border-border/60",
                  )}
                >
                  {ticket.priority}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-medium",
                    STATUS_STYLES[ticket.status] ??
                      "bg-muted text-muted-foreground",
                  )}
                >
                  {ticket.status}
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {ticket.id}
                </span>
              </div>
            </div>

            {/* Subject */}
            <div>
              <h1 className="text-2xl font-semibold text-foreground leading-snug">
                {ticket.subject}
              </h1>
            </div>

            {/* Metadata bar */}
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              <MetaItem label="Category" value={ticket.category} />
              <MetaItem label="Created" value={formattedCreated} />
              {ticket.created_by && (
                <MetaItem label="Created by" value={ticket.created_by.name} />
              )}
              <MetaItem label="Assigned to" value={ticket.assign_to || "—"} />
              {formattedUpdated && (
                <MetaItem label="Updated" value={formattedUpdated} />
              )}
            </div>

            {/* Divider */}
            <hr className="border-border/40" />

            {/* Description */}
            <DescriptionRenderer content={ticket.description} />

            {/* Divider */}
            <hr className="border-border/40" />

            {/* Attachments */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <>
                <AttachmentSection attachments={ticket.attachments} />
                <hr className="border-border/40" />
              </>
            )}

            {/* Timeline */}
            <div className="rounded-xl border border-border/40 bg-card p-5">
              <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-5">
                Progress
              </h2>
              <TimelineSection status={ticket.status} />
            </div>
          </div>

          {/* ─── Right: Live chat ─── */}
          <div className="flex flex-col rounded-lg border border-border/40 bg-card h-fit lg:sticky lg:top-2">
            {/* Chat header */}
            <div className="border-b border-border/40 px-4 py-3.5">
              <div className="flex items-center gap-2">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                <h2 className="text-sm font-semibold text-foreground">
                  Helpdesk Chat
                </h2>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
        Kami akan merespon dalam 1×24 jam. Riwayat percakapan tersimpan di tiket ini.
              </p>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[360px] max-h-[460px] scroll-smooth">
              {/* Mock message — helpdesk */}
              <div className="flex items-start gap-2.5 max-w-[85%]">
                <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-[#0B3464]/10 text-[10px] font-semibold text-[#0B3464]">
                  H
                </span>
                <div className="rounded-xl rounded-tl-sm bg-muted px-3 py-2">
                  <p className="text-xs text-foreground leading-relaxed">
                    Halo, kami sudah menerima laporan Anda dan sedang dalam proses investigasi oleh Tim Payroll. Kami akan update progresnya di sini.
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground/50">
                    14:32
                  </p>
                </div>
              </div>

              {/* Mock message — user */}
              <div className="flex items-start gap-2.5 max-w-[85%] ml-auto flex-row-reverse">
                <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-emerald-500/10 text-[10px] font-semibold text-emerald-600">
                  A
                </span>
                <div className="rounded-xl rounded-tr-sm bg-[#0B3464] px-3 py-2">
                  <p className="text-xs text-white leading-relaxed">
                    Baik, terima kasih. Apakah ada perkiraan waktu penyelesaian?
                  </p>
                  <p className="mt-1 text-[10px] text-white/50">
                    14:45
                  </p>
                </div>
              </div>
            </div>

            {/* Chat input */}
            <div className="border-t border-border/40 p-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ketik pesan..."
                  className="flex-1 rounded-lg border border-border/40 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors focus:border-border/80 focus:ring-1 focus:ring-border/60"
                />
                <button
                  type="button"
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#0B3464] text-white transition-all hover:brightness-110 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3464]/40"
                >
                  <Send className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
