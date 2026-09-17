import AdminTicketDetailModule from "@/modules/admin/ticket-detail";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ticket Detail",
  description: "Managing People. Anywhere. Anytime",
};

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminTicketDetailModule ticketId={id} />;
}
