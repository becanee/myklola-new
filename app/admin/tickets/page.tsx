"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAdminTickets } from "@/lib/store/admin-ticket-store";
import type { Ticket, TicketStatus, TicketPriority } from "@/lib/types/ticket";
import { Table } from "@/components/motion/table";
import { TicketActionDropdown } from "@/components/ui/action-dropdown";
import { ticketColumns, type Ticket as TableTicket } from "@/modules/tickets/table/column";

const statusOptions: Array<"all" | TicketStatus> = ["all", "To Do", "In Progress", "In Review", "Done", "Closed"];
const priorityOptions: Array<"all" | TicketPriority> = ["all", "Low", "Medium", "High", "Urgent"];

export default function AdminTicketsPage() {
  const { tickets, filter, setFilter } = useAdminTickets();
  const router = useRouter();
  const [view, setView] = useState<"list" | "board">("list");

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch =
        filter.search.trim() === "" ||
        ticket.title.toLowerCase().includes(filter.search.toLowerCase()) ||
        ticket.id.toLowerCase().includes(filter.search.toLowerCase());

      const matchesStatus = filter.status === "all" || ticket.status === filter.status;
      const matchesPriority = filter.priority === "all" || ticket.priority === filter.priority;
      const matchesAssignee = filter.assignee === "all" || ticket.assignee === filter.assignee;
      const matchesLabel = filter.label === "all" || ticket.labels.includes(filter.label);

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee && matchesLabel;
    });
  }, [tickets, filter]);

  const groupedByStatus = useMemo(() => {
    const statusList: TicketStatus[] = ["To Do", "In Progress", "In Review", "Done", "Closed"];
    return statusList.map((status) => ({
      status,
      items: filteredTickets.filter((item) => item.status === status),
    }));
  }, [filteredTickets]);

  const assignees = Array.from(new Set(tickets.map((ticket) => ticket.assignee)));
  const labels = Array.from(new Set(tickets.flatMap((ticket) => ticket.labels)));
  const tableRows: TableTicket[] = filteredTickets.map((ticket) => ({
    id: ticket.id,
    ticket_id: ticket.id,
    subject: ticket.title,
    category: ticket.type,
    status: ticket.status === "To Do" ? "Open" : ticket.status === "In Progress" ? "Investigate" : ticket.status === "In Review" ? "Pending" : ticket.status === "Done" ? "Resolved" : "Closed",
    priority: ticket.priority,
    created_at: new Date(ticket.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
    updated_at: new Date(ticket.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
    assign_to: ticket.assignee,
  }));

  const columns = [
    ...ticketColumns.map((column) => ({
      ...column,
      cell: (row: TableTicket) => (
        <span className="flex w-full items-center truncate text-left outline-none">
          {column.cell ? column.cell(row) : String((row as Record<string, unknown>)[column.key] ?? "")}
        </span>
      ),
    })),
    {
      key: "action",
      header: "Action",
      width: "80px",
      align: "center" as const,
      cell: (row: TableTicket) => (
        <TicketActionDropdown
          onViewDetail={() => router.push(`/admin/tickets/${row.id}`)}
          onEdit={() => router.push(`/admin/tickets/${row.id}/edit`)}
        />
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Management</p>
          <h1 className="text-2xl font-semibold text-foreground">Tickets</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("list")}
            className={view === "list" ? "rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary" : "rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground"}
          >
            List
          </button>
          <button
            onClick={() => setView("board")}
            className={view === "board" ? "rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary" : "rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground"}
          >
            Board
          </button>
          <Link href="/admin/tickets/new" className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
            <Plus className="size-4" />
            New Ticket
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="grid gap-3 lg:grid-cols-[1.5fr_180px_180px_180px_180px]">
          <label className="flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={filter.search}
              onChange={(event) => setFilter({ search: event.target.value })}
              placeholder="Search ticket..."
              className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
            />
          </label>

          <select value={filter.status} onChange={(e) => setFilter({ status: e.target.value as TicketStatus | "all" })} className="rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground">
            {statusOptions.map((status) => (
              <option key={status} value={status}>{status === "all" ? "All Status" : status}</option>
            ))}
          </select>

          <select value={filter.priority} onChange={(e) => setFilter({ priority: e.target.value as TicketPriority | "all" })} className="rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground">
            {priorityOptions.map((priority) => (
              <option key={priority} value={priority}>{priority === "all" ? "All Priority" : priority}</option>
            ))}
          </select>

          <select value={filter.assignee} onChange={(e) => setFilter({ assignee: e.target.value })} className="rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground">
            <option value="all">All Assignee</option>
            {assignees.map((person) => (
              <option key={person} value={person}>{person}</option>
            ))}
          </select>

          <select value={filter.label} onChange={(e) => setFilter({ label: e.target.value as any })} className="rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground">
            <option value="all">All Labels</option>
            {labels.map((label) => (
              <option key={label} value={label}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {view === "list" ? (
        <div className="rounded-2xl border border-border/50 bg-card p-3">
          <Table
            data={tableRows}
            columns={columns}
            getRowId={(row: TableTicket) => row.id}
            resizable
            reorderable
            defaultSort={{ key: "created_at", direction: "desc" }}
            height={440}
            rowHeight={48}
            emptyState="Geen tickets"
            className="rounded-xl border border-border/50"
          />
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-5">
          {groupedByStatus.map((group) => (
            <div key={group.status} className="rounded-2xl border border-border bg-card p-3">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-medium text-foreground">{group.status}</h3>
                <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">{group.items.length}</span>
              </div>

              <div className="space-y-3">
                {group.items.map((ticket) => (
                  <Link href={`/admin/tickets/${ticket.id}`} key={ticket.id} className="block rounded-xl border border-border bg-background p-3 hover:border-primary/50">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-blue-300">{ticket.id}</span>
                      <span className="text-[10px] uppercase text-muted-foreground">{ticket.priority}</span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-foreground">{ticket.title}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{ticket.assignee}</span>
                      <span>{new Date(ticket.createdAt).toLocaleDateString("id-ID")}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
