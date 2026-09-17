import AdminDashboardModule from "@/modules/admin/dashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Managing People. Anywhere. Anytime",
};

export default function AdminPage() {
  return <AdminDashboardModule />;
}
