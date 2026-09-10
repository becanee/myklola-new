import type { ReactNode } from "react";
import Sidebar from "@/components/sidebar";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return <Sidebar>{children}</Sidebar>;
}
