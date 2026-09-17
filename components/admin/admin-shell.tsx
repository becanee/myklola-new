"use client";

import { usePathname } from "next/navigation";
import SidebarClient from "@/components/sidebar-client";
import HeaderComp from "@/components/header-comp";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title = pathname === "/admin"
    ? "Dashboard"
    : pathname.startsWith("/admin/charts")
      ? "Charts Status"
    : pathname.startsWith("/admin/chat")
      ? "Chat"
      : pathname.includes("/new") || pathname.includes("/edit")
        ? "Tickets"
        : pathname.startsWith("/admin/tickets/")
          ? "Ticket Detail"
          : "Tickets";
  const path = title === "Dashboard"
    ? "Management > Dashboard"
    : title === "Charts Status"
      ? "Management > Charts Status"
    : title === "Chat"
      ? "Management > Chat"
      : title === "Ticket Detail"
        ? "Management > Tickets > Detail"
        : "Management > Tickets";

  return (
    <SidebarClient>
      <div className="flex min-h-screen w-full flex-col">
        <HeaderComp title={title} path={path} />
        <div className="-mt-14 flex flex-1 flex-col p-2">
          <div className="rounded-lg border border-border/40 bg-card p-6">
            {children}
          </div>
        </div>
      </div>
    </SidebarClient>
  );
}
