"use client";

import HeaderComp from "@/components/header-comp";
import { Loader } from "@/components/motion/loader";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  FileStack,
  Inbox,
  TicketCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

/* ─── Types ─── */

interface TicketRow {
  id: string;
  company_id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  assign_to: string | null;
  created_at: string;
}

/* ─── Stat card ─── */

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  trend,
}: {
  label: string;
  value: string | number;
  icon: typeof BarChart3;
  color: string;
  trend?: { value: string; positive: boolean };
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-5 transition-all hover:shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
        <div
          className="grid size-9 shrink-0 place-items-center rounded-lg"
          style={{ backgroundColor: color + "14" }}
        >
          <Icon className="size-4.5" style={{ color }} />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
      {trend && (
        <div className="mt-1.5 flex items-center gap-1">
          <TrendingUp
            className={cn(
              "size-3.5",
              trend.positive ? "text-emerald-500" : "text-rose-500",
            )}
          />
          <span
            className={cn(
              "text-xs font-medium",
              trend.positive ? "text-emerald-600" : "text-rose-600",
            )}
          >
            {trend.value}
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Status distribution bar ─── */

function StatusBar({ counts }: { counts: Record<string, number> }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  const segments = [
    { key: "Open", color: "bg-amber-500", label: "Open" },
    { key: "Pending", color: "bg-sky-500", label: "Pending" },
    { key: "Action Required", color: "bg-orange-500", label: "Action" },
    { key: "Investigate", color: "bg-violet-500", label: "Investigate" },
    { key: "Resolved", color: "bg-emerald-500", label: "Resolved" },
    { key: "Closed", color: "bg-neutral-400", label: "Closed" },
  ];

  return (
    <div className="rounded-xl border border-border/40 bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Status Overview
      </h3>
      <div className="flex h-3 overflow-hidden rounded-full bg-muted">
        {segments.map((seg) => {
          const w = ((counts[seg.key] ?? 0) / total) * 100;
          return w > 0 ? (
            <div
              key={seg.key}
              className={seg.color}
              style={{ width: `${w}%` }}
              title={`${seg.label}: ${counts[seg.key]}`}
            />
          ) : null;
        })}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs sm:grid-cols-6">
        {segments.map((seg) => (
          <div key={seg.key} className="flex items-center gap-1.5">
            <span
              className={`inline-block size-1.5 rounded-full ${seg.color}`}
            />
            <span className="text-muted-foreground">{seg.label}</span>
            <span className="font-medium text-foreground">
              {counts[seg.key] ?? 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Recent ticket row ─── */

const PRIORITY_DOT: Record<string, string> = {
  Low: "bg-slate-400",
  Medium: "bg-amber-400",
  High: "bg-orange-500",
  Urgent: "bg-rose-500",
};

const STATUS_STYLES: Record<string, string> = {
  Open: "bg-amber-500/10 text-amber-600",
  Pending: "bg-sky-500/10 text-sky-600",
  "Action Required": "bg-orange-500/10 text-orange-600",
  Investigate: "bg-violet-500/10 text-violet-600",
  Resolved: "bg-emerald-500/10 text-emerald-600",
  Closed: "bg-neutral-500/10 text-neutral-600",
};

function RecentTicketRow({ ticket, onRowClick }: { ticket: TicketRow; onRowClick: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onRowClick(ticket.id)}
      className="flex w-full items-center gap-4 px-1 py-3 border-b border-border/20 last:border-0 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      <span
        className={`inline-block size-2 shrink-0 rounded-full ${PRIORITY_DOT[ticket.priority] ?? "bg-border"}`}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">
            {ticket.company_id}
          </p>
          <span className="shrink-0 text-xs text-muted-foreground/30">/</span>
          <p className="truncate text-sm font-medium text-foreground">
            {ticket.subject}
          </p>
        </div>
        <p className="truncate text-xs text-muted-foreground mt-0.5">
          {ticket.id} &middot; {ticket.category}
        </p>
      </div>
      <span
        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[ticket.status] ?? "bg-muted text-muted-foreground"}`}
      >
        {ticket.status}
      </span>
    </button>
  );
}

/* ─── Helper ─── */

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

/* ─── Main module ─── */

export default function AdminDashboardModule() {
  const router = useRouter();
  const [rows, setRows] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/tickets")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) setRows(json.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const total = rows.length;
    const open = rows.filter((r) => r.status === "Open").length;
    const pending = rows.filter((r) => r.status === "Pending").length;
    const resolved = rows.filter(
      (r) => r.status === "Resolved" || r.status === "Closed",
    ).length;
    return { total, open, pending, resolved };
  }, [rows]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of rows) counts[r.status] = (counts[r.status] ?? 0) + 1;
    return counts;
  }, [rows]);

  const recentTickets = useMemo(() => rows.slice(0, 8), [rows]);

  const todayCount = useMemo(
    () =>
      rows.filter((r) => {
        const d = new Date(r.created_at);
        const today = new Date();
        return d.toDateString() === today.toDateString();
      }).length,
    [rows],
  );

  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col">
        <HeaderComp title="Admin Dashboard" path="Administration > Dashboard" />
        <div className="flex flex-1 items-center justify-center">
          <Loader variant="dot-matrix" size={36} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col">
      <HeaderComp title="Admin Dashboard" path="Administration > Dashboard" />

      <div className="flex flex-1 flex-col -mt-14 p-2 pb-16">
        <div className="rounded-lg border border-border/40 bg-card p-6 ">
          <div className="mx-auto w-full space-y-5">
            {/* ─── Overview: 4 key stat cards ─── */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Total Tickets"
                value={stats.total}
                icon={FileStack}
                color="#0B3464"
                trend={{
                  value: `${stats.open} open`,
                  positive: stats.open <= stats.resolved,
                }}
              />
              <StatCard
                label="Open"
                value={stats.open}
                icon={Inbox}
                color="#F59E0B"
              />
              <StatCard
                label="Pending"
                value={stats.pending}
                icon={Clock}
                color="#3B82F6"
              />
              <StatCard
                label="Resolved / Closed"
                value={stats.resolved}
                icon={TicketCheck}
                color="#10B981"
              />
            </div>

            {/* ─── Quick Summary + Status bar ─── */}
            <div className="grid gap-4 lg:grid-cols-4">
              {/* Status distribution — takes 3 cols */}
              <div className="lg:col-span-3">
                <StatusBar counts={statusCounts} />
              </div>

              {/* Quick summary — takes 1 col */}
              <div className="rounded-xl border border-border/40 bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  Quick Summary
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="size-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Today
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {todayCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="size-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Assigned
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {rows.filter((r) => r.assign_to).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Resolved %
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {stats.total > 0
                        ? Math.round((stats.resolved / stats.total) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Recent Tickets ─── */}
            <div className="rounded-xl border border-border/40 bg-card p-5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-foreground">
                  Recent Tickets
                </h3>
                <a
                  href="/tickets"
                  className="text-xs text-primary hover:underline"
                >
                  View all
                </a>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Latest {recentTickets.length} tickets by creation date
              </p>
              <div className="divide-y divide-border/20">
                {recentTickets.length > 0 ? (
                  recentTickets.map((t) => (
                    <RecentTicketRow key={t.id} ticket={t} onRowClick={(id) => router.push(`/admin/tickets/${id}`)} />
                  ))
                ) : (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No tickets yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
