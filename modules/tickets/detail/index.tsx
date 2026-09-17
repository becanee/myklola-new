"use client";

import HeaderComp from "@/components/header-comp";
import { StatusBadge } from "@/modules/tickets/table/column";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, FolderOpen, MessageSquareText, Send, UserRound, X } from "lucide-react";
import { getUserFromCookie } from "@/lib/utils";
import { fetchTicket, getTicketAttachmentUrl } from "../logic";

type TicketComment = {
  id: string;
  author: string;
  role: "Admin" | "Agent" | "Customer";
  message: string;
  createdAt: string;
};

type TicketActivity = {
  id: string;
  from: string;
  to: string;
  by: string;
  at: string;
};

type ApiTicket = Awaited<ReturnType<typeof fetchTicket>>;

function isImageAttachment(name?: string, type?: string) {
  if (type?.startsWith("image/")) return true;
  return /\.(png|jpe?g|gif|webp|svg|bmp|avif)$/i.test(name ?? "");
}

function attachmentIdentity(attachment: { url?: string; key?: string; name?: string }) {
  return attachment.key ?? attachment.url ?? attachment.name ?? "attachment";
}

const TICKET_THREAD_STORAGE_KEY = "klola-ticket-threads";

function formatDate(value?: string | null) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

const PRIORITY_STYLES: Record<string, string> = {
  Low: "bg-slate-100 text-slate-700 border-slate-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  High: "bg-orange-50 text-orange-700 border-orange-200",
  Urgent: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function TicketDetailModule() {
  const params = useParams<{ id?: string }>();
  const [ticket, setTicket] = useState<ApiTicket | null>(null);
  const [previewAttachment, setPreviewAttachment] = useState<{
    name: string;
    url: string;
    type?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  useEffect(() => {
    const id = params?.id;
    if (!id) {
      setLoading(false);
      return;
    }

    fetchTicket(id)
      .then(setTicket)
      .catch((error) => {
        console.error("Failed to load ticket detail:", error);
        setTicket(null);
      })
      .finally(() => setLoading(false));
  }, [params?.id]);

  const descriptionHtml = useMemo(() => {
    if (!ticket?.description) return "";
    return ticket.description;
  }, [ticket?.description]);

  const comments = ticket?.comments ?? [];
  const activity = ticket?.activity ?? (ticket ? [
    {
      id: `created-${ticket.id}`,
      from: "New",
      to: ticket.status,
      by: ticket.created_by || "User",
      at: ticket.created_at,
    },
  ] : []);

  useEffect(() => {
    if (!ticket) return;
    try {
      const stored = JSON.parse(window.localStorage.getItem(TICKET_THREAD_STORAGE_KEY) ?? "{}")[ticket.id];
      if (!stored) return;
      setTicket((current) => current ? {
        ...current,
        comments: stored.comments?.length ? stored.comments : current.comments,
        attachments: stored.attachments?.length
          ? Array.from(
              new Map(
                [...(current.attachments ?? []), ...stored.attachments].map((attachment) => [
                  attachmentIdentity(attachment),
                  attachment,
                ]),
              ).values(),
            )
          : current.attachments,
        activity: stored.activity?.length ? stored.activity : current.activity,
      } : current);
    } catch {
      // Ignore malformed development-only local storage data.
    }
  }, [ticket?.id]);

  const submitReply = () => {
    const message = reply.trim();
    if (!ticket || !message || replySubmitting) return;

    setReplySubmitting(true);
    const user = getUserFromCookie() as { name?: string } | null;
    const comment: TicketComment = {
      id: `comment-${Date.now()}`,
      author: user?.name || "User",
      role: "Customer",
      message,
      createdAt: new Date().toISOString(),
    };

    try {
      const storedThreads = JSON.parse(window.localStorage.getItem(TICKET_THREAD_STORAGE_KEY) ?? "{}");
      const currentThread = storedThreads[ticket.id] ?? {};
      const nextComments = [...(currentThread.comments ?? ticket.comments ?? []), comment];
      storedThreads[ticket.id] = {
        ...currentThread,
        comments: nextComments,
        attachments: currentThread.attachments ?? ticket.attachments ?? [],
      };
      window.localStorage.setItem(TICKET_THREAD_STORAGE_KEY, JSON.stringify(storedThreads));
      setTicket((current) => current ? { ...current, comments: nextComments } : current);
      setReply("");
    } catch (error) {
      console.error("Failed to save ticket reply:", error);
    } finally {
      setReplySubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-screen min-h-screen flex flex-col">
        <HeaderComp title="Ticket Detail" path="Management > Tickets > Detail" />
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Loading ticket...
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="w-screen min-h-screen flex flex-col">
        <HeaderComp title="Ticket Detail" path="Management > Tickets > Detail" />
        <div className="flex flex-1 justify-center p-6">
          <div className="w-full max-w-2xl rounded-xl border border-dashed border-border bg-card p-8 text-center">
            <p className="text-lg font-semibold text-foreground">Ticket not found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              The ticket you are looking for is not available or has been removed.
            </p>
            <Link
              href="/tickets"
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              <ArrowLeft className="size-4" />
              Back to tickets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen min-h-screen flex flex-col">
      <HeaderComp title="Ticket Detail" path="Management > Tickets > Detail" />

      <div className="flex flex-1 flex-col p-2 -mt-14">
        <div className="rounded-xl border border-border/40 bg-card p-5 sm:p-6">
          <div className="flex flex-col gap-4 border-b border-border/40 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${PRIORITY_STYLES[ticket.priority] ?? "bg-muted text-muted-foreground border-border/60"}`}
                >
                  {ticket.priority}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">{ticket.id}</span>
              </div>
              <h2 className="mt-3 text-xl font-semibold text-foreground">{ticket.subject ?? "(No subject)"}</h2>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/tickets"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                <ArrowLeft className="size-4" />
                Back
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <FolderOpen className="size-3.5" />
                Category
              </div>
              <p className="mt-2 text-sm font-medium text-foreground">{ticket.category}</p>
            </div>

            <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <MessageSquareText className="size-3.5" />
                Status
              </div>
              <div className="mt-2">
                <StatusBadge status={ticket.status} />
              </div>
            </div>

            <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <UserRound className="size-3.5" />
                Assigned to
              </div>
              <p className="mt-2 text-sm font-medium text-foreground">{ticket.assign_to || "-"}</p>
            </div>

            <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <CalendarDays className="size-3.5" />
                Created
              </div>
              <p className="mt-2 text-sm font-medium text-foreground">{formatDate(ticket.created_at)}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">
            <div className="rounded-xl border border-border/40 bg-background p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Description
              </h3>
              {descriptionHtml ? (
                <div
                  className="prose prose-sm max-w-none mt-4 text-sm text-foreground [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                  dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                />
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">No description provided.</p>
              )}

              <div className="mt-8 border-t border-border/40 pt-5">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Comments & Replies</h3>
                {comments.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {comments.map((comment) => (
                      <div key={comment.id} className="rounded-lg border border-border/50 bg-card p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="text-sm font-medium text-foreground">{comment.author}</span>
                            <span className="ml-2 text-xs text-muted-foreground">{comment.role}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{comment.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">No replies yet.</p>
                )}

                <div className="mt-5 border-t border-border/40 pt-4">
                  <label htmlFor="user-ticket-reply" className="text-sm font-medium text-foreground">
                    Reply to support
                  </label>
                  <textarea
                    id="user-ticket-reply"
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    placeholder="Tulis balasan atau informasi tambahan..."
                    className="mt-2 min-h-24 w-full resize-y rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                  />
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={submitReply}
                      disabled={!reply.trim() || replySubmitting}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Send className="size-4" />
                      {replySubmitting ? "Sending..." : "Send Reply"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-border/40 bg-background p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Ticket info
                </h3>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Updated</dt>
                    <dd className="font-medium text-foreground">{formatDate(ticket.updated_at)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Created by</dt>
                    <dd className="font-medium text-foreground">{ticket.created_by || "-"}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Closed avg</dt>
                    <dd className="font-medium text-foreground">{ticket.closed_avg ?? 0} days</dd>
                  </div>
                </dl>
              </div>

              {ticket.attachments && ticket.attachments.length > 0 ? (
                <div className="rounded-xl border border-border/40 bg-background p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Attachments
                  </h3>
                  <div className="mt-4 space-y-2">
                    {ticket.attachments.map((attachment, index) => (
                      (() => {
                        const attachmentUrl = getTicketAttachmentUrl(attachment.url, attachment.key);
                        return isImageAttachment(attachment.name, attachment.type) ? (
                        <button
                          key={`${attachmentIdentity(attachment)}-${index}`}
                          type="button"
                          disabled={!attachmentUrl}
                          onClick={() => attachmentUrl && setPreviewAttachment({
                            name: attachment.name || `Attachment ${index + 1}`,
                            url: attachmentUrl,
                            type: attachment.type,
                          })}
                          className="block w-full rounded-md border border-border/50 bg-muted/20 px-3 py-2 text-left text-sm text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {attachment.name || `Attachment ${index + 1}`}
                        </button>
                      ) : (
                        <a
                          key={`${attachmentIdentity(attachment)}-${index}`}
                          href={attachmentUrl || "#"}
                          download={attachment.name || true}
                          className="block rounded-md border border-border/50 bg-muted/20 px-3 py-2 text-sm text-primary hover:bg-muted hover:underline"
                        >
                          {attachment.name || `Attachment ${index + 1}`} · Download
                        </a>
                        );
                      })()
                    ))}
                  </div>
                </div>
              ) : null}

              {previewAttachment ? (
                <div className="rounded-xl border border-border/40 bg-background p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="truncate text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Preview: {previewAttachment.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setPreviewAttachment(null)}
                      className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label="Close attachment preview"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                  <div className="mt-4 overflow-hidden rounded-lg border border-border/50 bg-muted/20">
                    <img
                      src={previewAttachment.url}
                      alt={previewAttachment.name}
                      className="max-h-[480px] w-full object-contain"
                    />
                  </div>
                </div>
              ) : null}

              <div className="rounded-xl border border-border/40 bg-background p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Ticket Tracking</h3>
                <div className="mt-4 space-y-4">
                  {activity.map((item, index) => (
                    <div key={item.id} className="relative pl-5 text-sm">
                      {index < activity.length - 1 && <span className="absolute left-[3px] top-3 h-full w-px bg-border" />}
                      <span className="absolute left-0 top-1.5 size-2 rounded-full bg-primary" />
                      <p className="font-medium text-foreground">{item.to}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.by} · {formatDate(item.at)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
