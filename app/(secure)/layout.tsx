import type { ReactNode } from "react";
import SidebarClient from "@/components/sidebar-client";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return <SidebarClient>{children}</SidebarClient>;
}
