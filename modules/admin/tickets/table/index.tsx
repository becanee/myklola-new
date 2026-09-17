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
import { useMemo, useRef, useState } from "react";
import { ticketColumns, type Ticket } from "./column";

export function AllTicketsTable({ data }: { data: Ticket[] }) {
  const router = useRouter();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const openDropdownId = useRef<string | null>(null);

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
                    onClick={() => {
                      openDropdownId.current = row.id;
                    }}
                    className="inline-flex items-center justify-center w-full outline-none"
                  >
                    <span className="inline-flex items-center justify-center size-7 rounded-md transition-colors hover:bg-muted">
                      <Menu className="size-3.5 text-muted-foreground" />
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => setSelectedTicket(row)}>
                    <Eye className="size-3.5 mr-2" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push(`/admin/tickets/${row.id}`)}
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
        onOpenChange={(open) => {
          if (!open) setSelectedTicket(null);
        }}
      />
    </div>
  );
}
