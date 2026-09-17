import TicketsModule from "@/modules/tickets";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tickets Management",
  description: "Managing People. Anywhere. Anytime",
};

export default function TicketsPage() {
  return <TicketsModule />;
}
