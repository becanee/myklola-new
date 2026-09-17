"use client";

import HeaderComp from "@/components/header-comp";
import { CheckCircle2, Clock, FileStack, Inbox } from "lucide-react";
import { useMemo, useState } from "react";
import FilterBar from "./filter-bar";
import { AllTicketsTable, buildTickets } from "./table";

const ALL_DATA = buildTickets(200);

const statCards = [
  {
    label: "Total Tickets",
    key: "total",
    icon: FileStack,
    color: "#0B3464", 
  },
  {
    label: "Open",
    key: "open",
    icon: Inbox,
    color: "#F59E0B",
  },
  {
    label: "In Progress",
    key: "progress",
    icon: Clock,
    color: "#3B82F6",
  },
  {
    label: "Done",
    key: "done",
    icon: CheckCircle2,
    color: "#10B981",
  },
] as const;

export default function TicketsModule() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredData = useMemo(() => {
    return ALL_DATA.filter((t) => {
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
  }, [searchQuery, statusFilter, categoryFilter]);

  const counts = useMemo(() => {
    return {
      total: ALL_DATA.length,
      open: filteredData.filter((t) => t.status === "open").length,
      progress: filteredData.filter((t) => t.status === "progress").length,
      done: filteredData.filter((t) => t.status === "done").length,
    };
  }, [filteredData]);

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
                  ? counts.total
                  : stat.key === "open"
                    ? counts.open
                    : stat.key === "progress"
                      ? counts.progress
                      : counts.done;
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
                      <stat.icon
                        className="size-4"
                        style={{ color: stat.color }}
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-foreground">
                    {value}
                  </p>
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
