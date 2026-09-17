"use client";

import { cn } from "@/lib/utils";
import type { TableColumn } from "@/components/motion/table";

export type Ticket = {
  id: string;
  ticket_id: string;
  subject: string;
  category: string;
  status: string; // 'Open' | 'Pending' | 'Action Required' | 'Investigate' | 'Resolved' | 'Closed'
  priority: string;
  created_at: string;
  updated_at: string;
  assign_to: string;
};

const STATUS_STYLES: Record<string, string> = {
  Open: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Pending: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  "Action Required": "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  Investigate: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  Resolved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Closed: "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400",
};

const STATUS_LABELS: Record<string, string> = {
  Open: "Open",
  Pending: "Pending",
  "Action Required": "Action Required",
  Investigate: "Investigate",
  Resolved: "Resolved",
  Closed: "Closed",
};

export function StatusBadge({ status }: { status: string }) {
  const label = STATUS_LABELS[status] ?? status;
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {label}
    </span>
  );
}

export const ticketColumns: TableColumn<Ticket>[] = [
  {
    key: "ticket_id",
    header: "ID",
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
    header: "Subject",
    sortable: true,
    width: "1.8fr",
    cell: (row: Ticket) => (
      <span className="font-medium text-foreground">{row.subject}</span>
    ),
  },
  {
    key: "category",
    header: "Category",
    width: "120px",
    cell: (row: Ticket) => (
      <span className="text-muted-foreground">{row.category}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    width: "140px",
    cell: (row: Ticket) => <StatusBadge status={row.status} />,
  },
  {
    key: "priority",
    header: "Priority",
    width: "100px",
    cell: (row: Ticket) => (
      <span className="capitalize text-muted-foreground">{row.priority}</span>
    ),
  },
  {
    key: "created_at",
    header: "Created",
    sortable: true,
    align: "right",
    width: "130px",
    cell: (row: Ticket) => (
      <span className="tabular-nums text-xs text-muted-foreground">
        {row.created_at}
      </span>
    ),
  },
  {
    key: "action",
    header: "Action",
    width: "80px",
    cell: () => (
      <span className="inline-flex items-center justify-center w-full" />
    ),
  },
];
