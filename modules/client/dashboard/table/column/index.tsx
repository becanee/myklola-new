"use client";

import { cn } from "@/lib/utils";
import type { TableColumn } from "@/components/motion/table";

export type Ticket = {
  id: string;
  ticket_id: string;
  subject: string;
  category: string;
  status: "open" | "progress" | "done";
  priority: string;
  created_at: string;
  updated_at: string;
};

export const STATUS_STYLES: Record<Ticket["status"], string> = {
  open: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  progress: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  done: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

export function StatusBadge({ status }: { status: Ticket["status"] }) {
  const label =
    status === "progress" ? "In Progress" : status === "done" ? "Done" : "Open";
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        STATUS_STYLES[status],
      )}
    >
      {label}
    </span>
  );
}

export const ticketColumns: TableColumn<Ticket>[] = [
  {
    key: "ticket_id",
    header: "ID Tiket",
    sortable: true,
    width: "120px",
    cell: (row: Ticket) => (
      <span className="font-mono text-xs font-medium text-foreground">
        {row.ticket_id}
      </span>
    ),
  },
  {
    key: "subject",
    header: "Subjek",
    sortable: true,
    width: "1.8fr",
    cell: (row: Ticket) => (
      <span className="font-medium text-foreground">{row.subject}</span>
    ),
  },
  {
    key: "category",
    header: "Kategori",
    width: "120px",
    cell: (row: Ticket) => (
      <span className="text-muted-foreground">{row.category}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    width: "110px",
    cell: (row: Ticket) => <StatusBadge status={row.status} />,
  },
  {
    key: "priority",
    header: "Prioritas",
    width: "100px",
    cell: (row: Ticket) => (
      <span className="capitalize text-muted-foreground">{row.priority}</span>
    ),
  },
  {
    key: "created_at",
    header: "Dibuat",
    sortable: true,
    align: "right",
    width: "130px",
    cell: (row: Ticket) => (
      <span className="tabular-nums text-xs text-muted-foreground">
        {row.created_at}
      </span>
    ),
  },
];
