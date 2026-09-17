"use client";

import { useMemo, useState, useEffect } from "react";
import { Table } from "@/components/motion/table";
import { ticketColumns, type Ticket } from "./column";

function mapRow(row: Record<string, unknown>): Ticket {
  return {
    id: String(row.id ?? ""),
    ticket_id: String(row.id ?? ""),
    subject: String(row.subject ?? "(no subject)"),
    category: String(row.category ?? ""),
    status: (row.status as Ticket["status"]) ?? "open",
    priority: String(row.priority ?? ""),
    created_at: row.created_at
      ? new Date(String(row.created_at)).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-",
    updated_at: row.updated_at
      ? new Date(String(row.updated_at)).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-",
      assign_to: String(row.assign_to ?? "-"),
  };
}

export default function LatestTicketsTable() {
  const [rows, setRows] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    fetch("/api/v1/tickets")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setRows(json.data.map(mapRow));
        }
      })
      .catch(console.error);
  }, []);

  const columns = useMemo(
    () =>
      ticketColumns.map((col) => ({
        ...col,
        cell: (row: Ticket) => (
          <button
            type="button"
            onClick={() => setSelectedTicket(row)}
            className="flex w-full items-center truncate text-left outline-none"
          >
            {col.cell
              ? col.cell(row)
              : <span>{String((row as Record<string, unknown>)[col.key] ?? "")}</span>}
          </button>
        ),
      })),
    [],
  );

  return (
    <div className="flex w-full flex-col">
      <div className="flex items-center justify-between px-1 pb-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Latest Tickets</span>
        <span>{rows.length.toLocaleString()} datas</span>
      </div>
      <Table
        data={rows}
        columns={columns}
        getRowId={(row: Ticket) => row.id}
        resizable
        reorderable
        defaultSort={{ key: "created_at", direction: "desc" }}
        height={400}
        rowHeight={48}
        className="rounded-xl border border-border/50"
      />
    </div>
  );
}
