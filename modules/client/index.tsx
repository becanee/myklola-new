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
import OnBoarding from "./onboarding";
import LatestTicketsTable from "./table";

const stats = [
  {
    label: "Company",
    value: "Klola Indonesia",
    icon: BuildingComplex,
    color: "#0B3464",
  },
  {
    label: "Company ID",
    value: "KLOLA",
    icon: IdCard,
    color: "#3B82F6",
  },
  {
    label: "Total Tickets",
    value: "7",
    icon: Inbox,
    color: "#8B5CF6",
  },
  {
    label: "Solved Tickets",
    value: "6",
    icon: MessageCircleDashedCheck,
    color: "#10B981",
  },
];

export default function ClientModules() {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getUserFromCookie();
    setUser(u);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <Loader variant="dot-matrix" size={36} />
      </div>
    );
  }

  if (user?.role === "ONBOARD") {
    return <OnBoarding data={user} />;
  }

  return (
    <div className="w-screen">
      <HeaderComp />

      <div className="flex flex-1 flex-col -mt-20 p-4">
        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                  <stat.icon className="size-4" style={{ color: stat.color }} />
                </div>
              </div>
              <p className="mt-2 text-xl font-bold text-foreground">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Latest Tickets Table */}
        <div className="mt-8">
          <LatestTicketsTable />
        </div>
      </div>
    </div>
  );
}
