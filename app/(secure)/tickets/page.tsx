import TicketsModule from "@/modules/client/tickets";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tickets Management",
  description: "Managing People. Anywhere. Anytime",
};

export default function TicketsPage() {
  return <TicketsModule />;
}
