"use client";

import { useMemo } from "react";
import { Table } from "@/components/motion/table";
import { ticketColumns, type Ticket } from "../column";

const CATEGORIES = ["Technical", "Billing", "General", "Feature Request"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
const STATUSES: Ticket["status"][] = ["open", "progress", "done"];
const SUBJECTS = [
  "Login tidak bisa diakses",
  "Update data karyawan",
  "Bug pada laporan payroll",
  "Permintaan fitur baru",
  "Reset password",
  "Error saat export PDF",
  "Integrasi API gagal",
];

export function buildTickets(count: number): Ticket[] {
  const out: Ticket[] = [];
  for (let i = 0; i < count; i++) {
    const now = new Date();
    const created = new Date(now.getTime() - (count - i) * 3600000);
    out.push({
      id: String(i),
      ticket_id: `TKT-${String(1000 + i).padStart(4, "0")}`,
      subject: SUBJECTS[i % SUBJECTS.length],
      category: CATEGORIES[i % CATEGORIES.length],
      status: STATUSES[i % STATUSES.length],
      priority: PRIORITIES[i % PRIORITIES.length],
      created_at: created.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      updated_at: created.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    });
  }
  return out;
}

export function AllTicketsTable({
  data,
}: {
  data: Ticket[];
}) {
  const columns = useMemo(() => ticketColumns, []);

  return (
    <div className="flex w-full flex-col">
      <div className="flex items-center justify-between px-1 pb-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">All Tickets</span>
        <span>{data.length.toLocaleString()} tiket</span>
      </div>
      <Table
        data={data}
        columns={columns}
        getRowId={(row: Ticket) => row.id}
        resizable
        reorderable
        defaultSort={{ key: "created_at", direction: "desc" }}
        height={520}
        rowHeight={48}
        className="rounded-xl border border-border/50"
      />
    </div>
  );
}
