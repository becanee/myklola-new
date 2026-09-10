"use client";

import {
  FileStack,
  Inbox,
  TrendingUp,
  Users,
} from "lucide-react";

const stats = [
  { label: "Total Tiket", value: "128", icon: FileStack, change: "+12%", color: "#0B3464" },
  { label: "Dalam Proses", value: "45", icon: TrendingUp, change: "+5%", color: "#3B82F6" },
  { label: "Inbox Baru", value: "7", icon: Inbox, change: "-2", color: "#8B5CF6" },
  { label: "Tim Aktif", value: "23", icon: Users, change: "+3", color: "#10B981" },
];

export default function ClientModules() {
  return (
    <div className="flex flex-1 flex-col p-6 sm:p-8">
      <p className="text-xs font-medium text-muted-foreground">
        Thursday, September 11
      </p>
      <h2 className="mt-2 max-w-md text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        Selamat datang, Kevin.
      </h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Workspace Klola Anda siap digunakan. Berikut ringkasan aktivitas hari ini.
      </p>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border/50 bg-card p-4 transition-colors hover:bg-muted/30"
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
            <p className="mt-2 text-3xl font-bold text-foreground">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Main content area — add widgets or tables here */}
      <div className="mt-8 flex min-h-0 flex-1 items-center justify-center rounded-xl border border-dashed border-border/50">
        <p className="text-sm text-muted-foreground">
          Area konten utama — tambahkan widget atau tabel di sini.
        </p>
      </div>
    </div>
  );
}
