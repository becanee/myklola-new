"use client";

import { Table } from "@/components/motion/table";
import TicketDetailSheet from "@/components/ticket-detail-sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExternalLink, Eye, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
  const router = useRouter();
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
      ticketColumns.map((col) => {
        if (col.key === "action") {
          return {
            ...col,
            cell: (row: Ticket) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center w-full outline-none"
                  >
                    <span className="inline-flex items-center justify-center size-7 rounded-md transition-colors hover:bg-muted">
                      <Menu className="size-3.5 text-muted-foreground" />
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onClick={() => setSelectedTicket(row)}
                  >
                    <Eye className="size-3.5 mr-2" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push(`/tickets/${row.id}`)}
                  >
                    <ExternalLink className="size-3.5 mr-2" />
                    Detail
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          };
        }
        return col;
      }),
    [router],
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
      <TicketDetailSheet
        ticket={selectedTicket}
        open={!!selectedTicket}
        onOpenChange={(open) => { if (!open) setSelectedTicket(null); }}
      />
    </div>
  );
}
