"use client";

import { motion } from "motion/react";

const PRIORITIES = [
  { value: "Low", border: "border-slate-300", bg: "bg-slate-50" },
  { value: "Medium", border: "border-amber-300", bg: "bg-amber-50" },
  { value: "High", border: "border-orange-300", bg: "bg-orange-50" },
  { value: "Urgent", border: "border-rose-300", bg: "bg-rose-50" },
] as const;

export default function PriorityRadio({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {PRIORITIES.map((p) => {
        const selected = value === p.value;
        return (
          <label
            key={p.value}
            className={`relative cursor-pointer rounded-xl border p-3 text-center transition-all duration-150 ${
              selected
                ? `${p.border} ${p.bg} shadow-sm`
                : "border-border/60 bg-card hover:border-border/80"
            }`}
          >
            <input
              type="radio"
              name="priority"
              value={p.value}
              checked={selected}
              onChange={(e) => onChange(e.target.value)}
              className="sr-only"
            />
            <span
              className={`block text-sm font-medium ${
                selected ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {p.value}
            </span>
            <span
              className={`mt-1 block text-[10px] uppercase tracking-wider ${
                selected ? "text-foreground/50" : "text-muted-foreground/40"
              }`}
            >
              {selected
                ? { Low: "Not urgent", Medium: "Soon", High: "ASAP", Urgent: "Now" }[p.value]
                : "Priority"}
            </span>
            {selected && (
              <motion.div
                layoutId="priority-selected"
                className="absolute inset-x-0 bottom-0 mx-auto h-0.5 w-8 rounded-full bg-foreground/20"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </label>
        );
      })}
    </div>
  );
}
