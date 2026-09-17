"use client";

import { useMemo } from "react";
import { Activity, CheckCircle2, Clock3, Ticket as TicketIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { mockTickets } from "@/lib/mock-data/tickets";

const statusColors: Record<string, string> = {
  "To Do": "#94a3b8",
  "In Progress": "#0B3464",
  "In Review": "#8b5cf6",
  Done: "#10b981",
  Closed: "#64748b",
};

const statusChartConfig: ChartConfig = {
  count: { label: "Tickets", color: "#0B3464" },
};

const priorityChartConfig: ChartConfig = {
  count: { label: "Tickets", color: "#0B3464" },
};

const trendChartConfig: ChartConfig = {
  created: { label: "Created", color: "#0B3464" },
  resolved: { label: "Resolved", color: "#10b981" },
};

export default function AdminChartsPage() {
  const statusData = useMemo(() => ["To Do", "In Progress", "In Review", "Done", "Closed"].map((status) => ({ status, count: mockTickets.filter((ticket) => ticket.status === status).length })), []);
  const priorityData = useMemo(() => ["Low", "Medium", "High", "Urgent"].map((priority) => ({ priority, count: mockTickets.filter((ticket) => ticket.priority === priority).length })), []);
  const trendData = [
    { month: "May", created: 8, resolved: 5 },
    { month: "Jun", created: 12, resolved: 8 },
    { month: "Jul", created: 10, resolved: 9 },
    { month: "Aug", created: 16, resolved: 12 },
    { month: "Sep", created: mockTickets.length, resolved: mockTickets.filter((ticket) => ticket.status === "Done" || ticket.status === "Closed").length },
  ];
  const resolved = mockTickets.filter((ticket) => ticket.status === "Done" || ticket.status === "Closed").length;
  const open = mockTickets.filter((ticket) => ticket.status !== "Closed" && ticket.status !== "Done").length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Analytics</p>
        <h1 className="text-2xl font-semibold text-foreground">Status Charts</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-background p-4"><div className="flex items-center justify-between text-sm text-muted-foreground"><span>Total Tickets</span><TicketIcon className="size-4" /></div><p className="mt-2 text-2xl font-semibold text-foreground">{mockTickets.length}</p></div>
        <div className="rounded-xl border border-border bg-background p-4"><div className="flex items-center justify-between text-sm text-muted-foreground"><span>Open Workload</span><Clock3 className="size-4" /></div><p className="mt-2 text-2xl font-semibold text-foreground">{open}</p></div>
        <div className="rounded-xl border border-border bg-background p-4"><div className="flex items-center justify-between text-sm text-muted-foreground"><span>Resolved</span><CheckCircle2 className="size-4 text-emerald-600" /></div><p className="mt-2 text-2xl font-semibold text-foreground">{resolved}</p></div>
        <div className="rounded-xl border border-border bg-background p-4"><div className="flex items-center justify-between text-sm text-muted-foreground"><span>Resolution Rate</span><Activity className="size-4" /></div><p className="mt-2 text-2xl font-semibold text-foreground">{mockTickets.length ? Math.round((resolved / mockTickets.length) * 100) : 0}%</p></div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-xl border border-border bg-background p-5">
          <div className="mb-4"><h2 className="font-semibold text-foreground">Tickets by Status</h2><p className="text-sm text-muted-foreground">Current distribution across the workflow.</p></div>
          <ChartContainer config={statusChartConfig} className="h-[320px] w-full min-h-0">
            <BarChart data={statusData} accessibilityLayer margin={{ left: 0, right: 8, top: 10, bottom: 4 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="status" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                {statusData.map((item) => <Cell key={item.status} fill={statusColors[item.status]} />)}
              </Bar>
            </BarChart>
          </ChartContainer>
        </section>

        <section className="rounded-xl border border-border bg-background p-5">
          <div className="mb-4"><h2 className="font-semibold text-foreground">Tickets by Priority</h2><p className="text-sm text-muted-foreground">Identify where urgent work is concentrated.</p></div>
          <ChartContainer config={priorityChartConfig} className="h-[320px] w-full min-h-0">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie data={priorityData} dataKey="count" nameKey="priority" innerRadius={62} outerRadius={100} paddingAngle={3}>
                {priorityData.map((item, index) => <Cell key={item.priority} fill={["#94a3b8", "#3b82f6", "#f59e0b", "#ef4444"][index]} />)}
              </Pie>
              <Legend content={<ChartLegendContent />} />
            </PieChart>
          </ChartContainer>
        </section>
      </div>

      <section className="rounded-xl border border-border bg-background p-5">
        <div className="mb-4"><h2 className="font-semibold text-foreground">Ticket Volume Trend</h2><p className="text-sm text-muted-foreground">Created and resolved tickets over the last five months.</p></div>
        <ChartContainer config={trendChartConfig} className="h-[320px] w-full min-h-0">
          <LineChart data={trendData} margin={{ left: 0, right: 12, top: 10, bottom: 4 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend content={<ChartLegendContent />} />
            <Line type="monotone" dataKey="created" stroke="var(--color-created)" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="resolved" stroke="var(--color-resolved)" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ChartContainer>
      </section>
    </div>
  );
}
