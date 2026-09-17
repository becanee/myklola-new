import type { Metadata } from "next";
import TicketDetailModule from "@/modules/tickets/detail";

export const metadata: Metadata = {
  title: "Ticket Detail",
  description: "Detail of a support ticket",
};

export default function TicketDetailPage() {
  return <TicketDetailModule />;
}
