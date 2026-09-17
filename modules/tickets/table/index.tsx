"use client";

import { useMemo, useState } from "react";
import { Table } from "@/components/motion/table";
import { ticketColumns, type Ticket } from "./column";
import TicketDetailSheet from "@/components/ticket-detail-sheet";

export function AllTicketsTable({ data }: { data: Ticket[] }) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

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
        height={400}
        rowHeight={48}
        className="rounded-xl border border-border/50"
      />
      <TicketDetailSheet
        ticket={selectedTicket}
        open={!!selectedTicket}
        onOpenChange={(open) => { if (!open) setSelectedTicket(null); }}
      />
    </div>
  );
}
