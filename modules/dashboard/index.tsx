"use client";

import HeaderComp from "@/components/header-comp";
import { Loader } from "@/components/motion/loader";
import { getUserFromCookie } from "@/lib/utils";
import {
  BuildingComplex,
  IdCard,
  Inbox,
  MessageCircleDashedCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import LatestTicketsTable from "./table";

export default function ClientModules() {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [ticketCount, setTicketCount] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);

  useEffect(() => {
    const u = getUserFromCookie();
    setUser(u);

    fetch("/api/v1/tickets")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setTicketCount(json.data.length);
          setSolvedCount(
            json.data.filter(
              (t: Record<string, unknown>) =>
                t.status === "Resolved" || t.status === "Closed",
            ).length,
          );
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    {
      label: "Company",
      value: user?.company_name,
      icon: BuildingComplex,
      color: "#0B3464",
    },
    {
      label: "Branch",
      value: user?.branch,
      icon: IdCard,
      color: "#3B82F6",
    },
    {
      label: "Total Tickets",
      value: ticketCount,
      icon: Inbox,
      color: "#8B5CF6",
    },
    {
      label: "Solved Tickets",
      value: solvedCount,
      icon: MessageCircleDashedCheck,
      color: "#10B981",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <Loader variant="dot-matrix" size={36} />
      </div>
    );
  }

  return (
    <div className="w-screen min-h-screen flex flex-col">
      <HeaderComp />

      <div className="flex flex-1 flex-col -mt-14 p-2 pb-16">
        <div className="rounded-lg border border-border/40 bg-card p-6 ">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border/50 bg-card p-4 transition-colors hover:bg-muted"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </span>
                  <div
                    className="grid size-8 shrink-0 place-items-center rounded-lg"
                    style={{ backgroundColor: stat.color + "18" }}
                  >
                    <stat.icon
                      className="size-4"
                      style={{ color: stat.color }}
                    />
                  </div>
                </div>
                <p className="mt-2 text-xl font-bold text-foreground">
                  {typeof stat.value === "string" ||
                  typeof stat.value === "number"
                    ? stat.value
                    : ""}
                </p>
              </div>
            ))}
          </div>

          {/* Latest Tickets Table */}
          <div className="mt-6">
            <LatestTicketsTable />
          </div>
        </div>
      </div>
    </div>
  );
}
