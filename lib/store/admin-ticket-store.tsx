"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { mockTickets } from "@/lib/mock-data/tickets";
import type {
  Ticket,
  TicketAttachment,
  TicketComment,
  TicketActivity,
  TicketFilter,
  TicketStatus,
} from "@/lib/types/ticket";

const TICKET_THREAD_STORAGE_KEY = "klola-ticket-threads";

function persistTicketThread(
  ticketId: string,
  comments: TicketComment[],
  attachments: TicketAttachment[],
  activity?: TicketActivity[],
) {
  if (typeof window === "undefined") return;
  const current = JSON.parse(window.localStorage.getItem(TICKET_THREAD_STORAGE_KEY) ?? "{}");
  current[ticketId] = { comments, attachments, ...(activity ? { activity } : {}) };
  window.localStorage.setItem(TICKET_THREAD_STORAGE_KEY, JSON.stringify(current));
}

type AdminTicketContextValue = {
  tickets: Ticket[];
  filter: TicketFilter;
  setFilter: (next: Partial<TicketFilter>) => void;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  addTicketComment: (ticketId: string, comment: TicketComment) => void;
  addTicketAttachments: (ticketId: string, attachments: TicketAttachment[]) => void;
  addTicket: (ticket: Ticket) => void;
};

const defaultFilter: TicketFilter = {
  status: "all",
  priority: "all",
  assignee: "all",
  label: "all",
  search: "",
};

const AdminTicketContext = createContext<AdminTicketContextValue | null>(null);

export function AdminTicketProvider({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [filter, setFilterState] = useState<TicketFilter>(defaultFilter);

  useEffect(() => {
    try {
      const stored = JSON.parse(
        window.localStorage.getItem(TICKET_THREAD_STORAGE_KEY) ?? "{}",
      ) as Record<string, Partial<Pick<Ticket, "comments" | "attachments" | "activity">>>;
      setTickets((current) =>
        current.map((ticket) => {
          const thread = stored[ticket.id];
          if (!thread) return ticket;
          return {
            ...ticket,
            comments: thread.comments?.length ? thread.comments : ticket.comments,
            attachments: thread.attachments?.length ? thread.attachments : ticket.attachments,
            activity: thread.activity?.length ? thread.activity : ticket.activity,
          };
        }),
      );
    } catch {
      // Ignore malformed development-only local storage data.
    }
  }, []);

  const setFilter = (next: Partial<TicketFilter>) => {
    setFilterState((prev) => ({ ...prev, ...next }));
  };

  const updateTicketStatus = (ticketId: string, status: TicketStatus) => {
    const ticket = tickets.find((item) => item.id === ticketId);
    if (ticket) {
      persistTicketThread(ticketId, ticket.comments, ticket.attachments, [
        {
          id: `ac-${Date.now()}`,
          from: ticket.status,
          to: status,
          by: "Admin",
          at: new Date().toISOString(),
        },
        ...ticket.activity,
      ]);
    }
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              status,
              activity: [
                {
                  id: `ac-${Date.now()}`,
                  from: ticket.status,
                  to: status,
                  by: "Admin",
                  at: new Date().toISOString(),
                },
                ...ticket.activity,
              ],
            }
          : ticket,
      ),
    );
  };

  const addTicket = (ticket: Ticket) => {
    setTickets((prev) => [ticket, ...prev]);
  };

  const addTicketComment = (ticketId: string, comment: TicketComment) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, comments: [...ticket.comments, comment] }
          : ticket,
      ),
    );
    const ticket = tickets.find((item) => item.id === ticketId);
    if (ticket) persistTicketThread(ticketId, [...ticket.comments, comment], ticket.attachments);
  };

  const addTicketAttachments = (
    ticketId: string,
    attachments: TicketAttachment[],
  ) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, attachments: [...ticket.attachments, ...attachments] }
          : ticket,
      ),
    );
    const ticket = tickets.find((item) => item.id === ticketId);
    if (ticket) persistTicketThread(ticketId, ticket.comments, [...ticket.attachments, ...attachments]);
  };

  const value = useMemo(
    () => ({
      tickets,
      filter,
      setFilter,
      updateTicketStatus,
      addTicketComment,
      addTicketAttachments,
      addTicket,
    }),
    [tickets, filter],
  );

  return (
    <AdminTicketContext.Provider value={value}>{children}</AdminTicketContext.Provider>
  );
}

export function useAdminTickets() {
  const context = useContext(AdminTicketContext);
  if (!context) {
    throw new Error("useAdminTickets must be used within AdminTicketProvider");
  }
  return context;
}
