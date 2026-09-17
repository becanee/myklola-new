"use client";

import HeaderComp from "@/components/header-comp";
import { CheckCircle2, Clock, FileStack, Inbox } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import FilterBar from "./filter-bar";
import { AllTicketsTable } from "./table";

interface ApiTicket {
  id: string;
  company_id: string | null;
  subject: string | null;
  category: string;
  priority: string;
  status: string;
  description: string | null;
  attachments: unknown[] | null;
  closed_avg: number;
  created_at: string;
  created_by: string | null;
  updated_at: string | null;
  updated_by: string | null;
  assign_to: string;
}

function mapTicket(row: ApiTicket) {
  return {
    id: row.id,
    ticket_id: row.id,
    subject: row.subject ?? "(no subject)",
    category: row.category,
    status: row.status,
    priority: row.priority,
    created_at: row.created_at
      ? new Date(row.created_at).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-",
    updated_at: row.updated_at
      ? new Date(row.updated_at).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-",
    assign_to: row.assign_to,
  };
}

const statCards = [
  { label: "Total Tickets", key: "total", icon: FileStack, color: "#0B3464" },
  { label: "Open", key: "Open", icon: Inbox, color: "#F59E0B" },
  { label: "Pending", key: "Pending", icon: Clock, color: "#3B82F6" },
  { label: "Resolved", key: "Resolved", icon: CheckCircle2, color: "#10B981" },
] as const;

const STATUS_KEYS: Record<string, string> = {
  Open: "Open",
  Pending: "Pending",
  "Action Required": "Action Required",
  Investigate: "Investigate",
  Resolved: "Resolved",
  Closed: "Closed",
};

export default function TicketsModule() {
  const [rows, setRows] = useState<ApiTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    fetch("/api/v1/tickets")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setRows(json.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const mapped = useMemo(() => rows.map(mapTicket), [rows]);

  const filteredData = useMemo(() => {
    return mapped.filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        t.ticket_id.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || t.status === statusFilter;
      const matchCategory =
        categoryFilter === "all" || t.category === categoryFilter;
      return matchSearch && matchStatus && matchCategory;
    });
  }, [mapped, searchQuery, statusFilter, categoryFilter]);

  if (loading) {
    return (
      <div className="w-screen min-h-screen flex flex-col">
        <HeaderComp title="Tickets" path="Management > Tickets" />
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Loading tickets...
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen min-h-screen flex flex-col">
      <HeaderComp title="Tickets" path="Management > Tickets" />
      <div className="flex flex-1 flex-col p-2 -mt-14">
        <div className="rounded-lg border border-border/40 bg-card p-6">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => {
              const value =
                stat.key === "total"
                  ? filteredData.length
                  : filteredData.filter((t) => t.status === stat.key).length;
              return (
                <div
                  key={stat.key}
                  className="rounded-xl border border-border/50 bg-card p-4 transition-colors hover:bg-muted"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </span>
                    <div
                      className="grid size-8 shrink-0 place-items-center rounded-lg"
                      style={{ backgroundColor: stat.color + "18" }}
                    >
                      <stat.icon className="size-4" style={{ color: stat.color }} />
                    </div>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
                </div>
              );
            })}
          </div>

          {/* Filter bar */}
          <div className="mt-6">
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
            />
          </div>

          {/* Table */}
          <div className="mt-4">
            <AllTicketsTable data={filteredData} />
          </div>
        </div>
      </div>
    </div>
  );
}
