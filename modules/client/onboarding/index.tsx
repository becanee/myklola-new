"use client";

import { motion } from "motion/react";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import Link from "next/link";

const steps = [
  { label: "Identity verification", status: "done" as const },
  { label: "Company registration", status: "done" as const },
  { label: "Admin assignment", status: "active" as const },
  { label: "Workspace provisioning", status: "pending" as const },
  { label: "Access configuration", status: "pending" as const },
];

function StatusIcon({ status }: { status: "done" | "active" | "pending" }) {
  if (status === "done")
    return <CheckCircle2 className="size-4 text-emerald-500" />;
  if (status === "active")
    return <Loader2 className="size-4 animate-spin text-[#0B3464]" />;
  return <Clock className="size-4 text-neutral-400" />;
}

export default function OnBoarding({ data }: any) {

  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center px-4 py-12">
      {/* Card */}
      <motion.div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-border/60 bg-card shadow-lg"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header section */}
        <div className="border-b border-border/40 px-8 pt-8 pb-6">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {data?.company_name}
              </p>
              <p className="text-xs text-muted-foreground">Account setup</p>
            </div>
          </div>

          <div className="mt-6 space-y-1">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Onboarding in progress
            </h1>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Your workspace is being configured. Most steps complete
              automatically — we&apos;ll notify you once everything is ready.
            </p>
          </div>

          {/* Progress bar */}
          <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-[#0B3464]"
              initial={{ width: "0%" }}
              animate={{ width: "60%" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>

        {/* Steps section */}
        <div className="px-8 py-6">
          <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Setup progress
          </h3>

          <div className="mt-4 space-y-3">
            {steps.map((step) => (
              <div key={step.label} className="flex items-center gap-3 text-sm">
                <StatusIcon status={step.status} />
                <span
                  className={
                    step.status === "pending"
                      ? "text-muted-foreground/40"
                      : step.status === "active"
                        ? "font-medium text-foreground"
                        : "text-muted-foreground/70"
                  }
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* <p className="mt-6 text-xs text-muted-foreground/60">
            Estimated time remaining: ~2–5 minutes
          </p> */}
        </div>
      </motion.div>

      {/* Support link */}
      <motion.p
        className="mt-6 text-center text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        Need help?{" "}
        <Link
          href="/contact"
          target="tab"
          className="font-medium text-[#0B3464] underline-offset-4 hover:underline"
        >
          Contact support
        </Link>
      </motion.p>
    </div>
  );
}
