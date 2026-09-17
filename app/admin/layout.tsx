import { AdminTicketProvider } from "@/lib/store/admin-ticket-store";
import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminTicketProvider>
      <AdminShell>{children}</AdminShell>
    </AdminTicketProvider>
  );
}
