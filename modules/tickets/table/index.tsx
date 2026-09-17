"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Table } from "@/components/motion/table";
import { TicketActionDropdown } from "@/components/ui/action-dropdown";
import { ticketColumns, type Ticket } from "./column";

export function AllTicketsTable({ data }: { data: Ticket[] }) {
  const router = useRouter();

  const columns = useMemo(
    () => [
      ...ticketColumns.map((col) => ({
        ...col,
        cell: (row: Ticket) => (
          <span className="flex w-full items-center truncate text-left outline-none">
            {col.cell
              ? col.cell(row)
              : <span>{String((row as Record<string, unknown>)[col.key] ?? "")}</span>}
          </span>
        ),
      })),
      {
        key: "action",
        header: "Action",
        width: "80px",
        align: "center" as const,
        cell: (row: Ticket) => (
          <TicketActionDropdown
            onViewDetail={() => router.push(`/tickets/${row.id}`)}
            onEdit={() => router.push(`/tickets/${row.id}/edit`)}
          />
        ),
      },
    ],
    [router],
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
    </div>
  );
}
