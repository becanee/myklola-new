"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { Ticket } from "@/modules/client/dashboard/table/column";

interface TimelineStep {
  label: string;
  description?: string;
  status: "done" | "current" | "upcoming";
}

const TIMELINE: TimelineStep[] = [
  { label: "Submitted", description: "Ticket has been created", status: "done" },
  { label: "Pending", description: "Awaiting initial review", status: "done" },
  { label: "Action Required", description: "Additional information needed", status: "current" },
  { label: "Investigate", description: "Under investigation by the team", status: "upcoming" },
  { label: "Resolved / Closed / Rejected", status: "upcoming" },
];

const PRIORITY_STYLES: Record<string, string> = {
  Low: "bg-slate-100 text-slate-700 border-slate-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  High: "bg-orange-50 text-orange-700 border-orange-200",
  Urgent: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function TicketDetailSheet({
  ticket,
  open,
  onOpenChange,
}: {
  ticket: Ticket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!ticket) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[420px] p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="shrink-0 px-5 py-5 border-b border-border/40">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              "rounded-md border px-2 py-0.5 text-[11px] font-medium",
              PRIORITY_STYLES[ticket.priority] ?? "bg-muted text-muted-foreground border-border/60",
            )}>
              {ticket.priority}
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">
              {ticket.ticket_id}
            </span>
          </div>
          <SheetTitle className="text-left text-base font-semibold leading-snug text-foreground">
            {ticket.subject}
          </SheetTitle>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-8">
          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Category</p>
              <p className="mt-1 text-sm text-foreground">{ticket.category}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Status</p>
              <p className="mt-1 text-sm capitalize text-foreground">{ticket.status}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Assigned to</p>
              <p className="mt-1 text-sm text-foreground">—</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Created</p>
              <p className="mt-1 text-sm text-foreground">{ticket.created_at}</p>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Progress
            </h3>

            <div className="space-y-0">
              {TIMELINE.map((step, i) => (
                <div key={step.label} className="flex gap-3">
                  {/* Dot + line column */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "size-2.5 rounded-full shrink-0 mt-1",
                        step.status === "done" && "bg-emerald-500",
                        step.status === "current" && "bg-[#0B3464]",
                        step.status === "upcoming" && "bg-border",
                      )}
                    />
                    {i < TIMELINE.length - 1 && (
                      <div
                        className={cn(
                          "mt-1 w-px flex-1 min-h-[28px]",
                          step.status === "done" ? "bg-emerald-500/30" : "bg-border",
                        )}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className={cn("pb-6", i === TIMELINE.length - 1 && "pb-0")}>
                    <p
                      className={cn(
                        "text-sm leading-tight",
                        step.status === "upcoming" && "text-muted-foreground/40",
                        step.status === "done" && "text-muted-foreground/70 line-through decoration-1 decoration-muted-foreground/20",
                        step.status === "current" && "font-medium text-foreground",
                      )}
                    >
                      {step.label}
                    </p>
                    {step.description && (
                      <p
                        className={cn(
                          "mt-0.5 text-xs leading-relaxed",
                          step.status === "upcoming" && "text-muted-foreground/30",
                          step.status === "done" && "text-muted-foreground/50",
                          step.status === "current" && "text-muted-foreground/70",
                        )}
                      >
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
