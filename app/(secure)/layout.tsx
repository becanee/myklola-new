"use client";

import { getUserFromCookie } from "@/lib/utils";
import SidebarClient from "@/components/sidebar-client";
import SidebarAdmin from "@/components/sidebar-admin";
import type { ReactNode } from "react";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const user = getUserFromCookie();
  const isAdmin = user?.role && user.role !== "CLIENT";

  if (isAdmin) {
    return <SidebarAdmin>{children}</SidebarAdmin>;
  }

  return <SidebarClient>{children}</SidebarClient>;
}
