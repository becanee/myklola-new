"use client";

import { useMemo } from "react";
import { ArrowUpRight, CheckCheck, CircleDashed, Clock3, RefreshCcw } from "lucide-react";
import { useAdminTickets } from "@/lib/store/admin-ticket-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminChartsPage from "@/app/admin/charts/page";

const statusMeta = [
  { key: "To Do", label: "To Do", color: "bg-muted text-muted-foreground" },
  { key: "In Progress", label: "In Progress", color: "bg-blue-500/15 text-blue-300" },
  { key: "In Review", label: "In Review", color: "bg-violet-500/15 text-violet-300" },
  { key: "Done", label: "Done", color: "bg-emerald-500/15 text-emerald-300" },
  { key: "Closed", label: "Closed", color: "bg-neutral-500/15 text-neutral-300" },
] as const;

export default function AdminDashboardPage() {
  const { tickets } = useAdminTickets();

  const summary = useMemo(() => {
    return statusMeta.map((meta) => ({
      ...meta,
      count: tickets.filter((ticket) => ticket.status === meta.key).length,
    }));
  }, [tickets]);

  const newest = useMemo(() => [...tickets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4), [tickets]);

  return (
    <Tabs defaultValue="ess" className="space-y-6">
      <TabsList className="h-10 rounded-none border-b border-border bg-transparent p-0">
        <TabsTrigger value="ess" className="rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
          Ticket Overview
        </TabsTrigger>
        <TabsTrigger value="payroll" className="rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
          Status Analytics
        </TabsTrigger>
      </TabsList>

      <TabsContent value="ess" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Overview</p>
            <h1 className="text-2xl font-semibold text-foreground">Admin Dashboard</h1>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground hover:bg-muted">
            <RefreshCcw className="size-4" />
            Refresh
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {summary.map((item) => (
          <div key={item.key} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${item.color}`}>{item.label}</span>
              <span className="text-muted-foreground">
                {item.key === "To Do" && <CircleDashed className="size-4" />}
                {item.key === "In Progress" && <Clock3 className="size-4" />}
                {item.key === "In Review" && <ArrowUpRight className="size-4" />}
                {item.key === "Done" && <CheckCheck className="size-4" />}
                {item.key === "Closed" && <CheckCheck className="size-4" />}
              </span>
            </div>
            <p className="mt-5 text-3xl font-bold text-foreground">{item.count}</p>
          </div>
        ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent Tickets</h2>
            <button className="text-sm text-primary">View all</button>
          </div>

          <div className="space-y-3">
            {newest.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between rounded-xl border border-border bg-background p-3">
                <div>
                  <p className="font-medium text-foreground">{ticket.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{ticket.id}</span>
                    <span>•</span>
                    <span>{ticket.assignee}</span>
                  </div>
                </div>
                <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">{ticket.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg font-semibold text-foreground">Quick Summary</h2>
          <div className="mt-5 space-y-4 text-sm text-muted-foreground">
            <div className="flex items-center justify-between rounded-xl bg-background p-3">
              <span>Open Tickets</span>
              <strong className="text-foreground">{tickets.filter((t) => t.status !== "Closed").length}</strong>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-background p-3">
              <span>Avg. Response</span>
              <strong className="text-foreground">2.4h</strong>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-background p-3">
              <span>Resolved</span>
              <strong className="text-foreground">{tickets.filter((t) => t.status === "Done" || t.status === "Closed").length}</strong>
            </div>
          </div>
        </div>
        </div>
      </TabsContent>

      <TabsContent value="payroll">
        <AdminChartsPage />
      </TabsContent>
    </Tabs>
  );
}
