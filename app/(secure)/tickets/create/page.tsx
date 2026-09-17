import CreateTicketModule from "@/modules/client/create-tickets";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Tickets",
  description: "Managing People. Anywhere. Anytime",
};

export default function TicketsPage() {
  return <CreateTicketModule />;
}