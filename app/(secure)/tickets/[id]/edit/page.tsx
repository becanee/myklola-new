import type { Metadata } from "next";
import EditTicketModule from "@/modules/tickets/edit";

export const metadata: Metadata = {
  title: "Edit Ticket",
  description: "Edit existing support ticket",
};

export default function EditTicketPage() {
  return <EditTicketModule />;
}
