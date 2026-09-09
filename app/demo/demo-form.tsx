"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input as MotionInput } from "@/components/motion/input";
import {
  MorphSelect,
  MorphSelectContent,
  MorphSelectItem,
  MorphSelectTrigger,
  MorphSelectValue,
} from "@/components/motion/select-morph";
import { Turnstile } from "@marsidev/react-turnstile";
import {
  AlertCircle,
  CalendarIcon,
  Check,
  Clock,
  User,
  Building2,
  Mail,
  Phone,
} from "lucide-react";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!;

const formSchema = z.object({
  // Identity
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  companyName: z.string(),
  email: z.string().email("Invalid email format"),
  phone: z.string(),

  // Request
  purpose: z
    .string()
    .min(5, "Tell us a little about the purpose (min 5 characters)"),
  questions: z.string(),

  // Scheduling
  date: z
    .date()
    .refine((d) => d !== undefined, {
      message: "Please pick a preferred date",
    }),
  duration: z.string().min(1, "Please select a demo length"),
  startTime: z.string().min(1, "Please select a preferred start time"),
});

type FormData = z.infer<typeof formSchema>;

const durations = [
  "10 mins – 30 mins",
  "30 mins – 1 hour",
  "1 hour – 2 hours",
  "Other",
];

// Business-hours start slots, 30-min step (WIB = UTC+7)
const timeSlots = (() => {
  const slots: string[] = [];
  for (let h = 9; h < 17; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  return slots;
})();

function SectionHeading({
  number,
  title,
  desc,
}: {
  number: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-baseline gap-4 pt-2">
      <span className="font-mono text-xs text-muted-foreground shrink-0">
        {number}
      </span>
      <div>
        <h2 className="text-xl font-instrument tracking-tight text-foreground">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

export function DemoForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<"success" | "error" | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      companyName: "",
      email: "",
      phone: "",
      purpose: "",
      questions: "",
      duration: "",
      startTime: "",
    },
    mode: "onChange",
  });

  const isSubmitting = isPending;
  const date = watch("date");
  const duration = watch("duration");
  const startTime = watch("startTime");

  // beUI motion input errors
  const fullNameError = errors.fullName?.message || false;
  const companyError = errors.companyName?.message || false;
  const emailError = errors.email?.message || false;
  const phoneError = errors.phone?.message || false;
  const purposeError = errors.purpose?.message || false;
  const questionsError = errors.questions?.message || false;

  const onSubmit = (data: FormData) => {
    if (!token) return;
    setResult(null);
    startTransition(async () => {
      try {
        await fetch("/api/demo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, token }),
        });
        setResult("success");
        reset();
      } catch {
        setResult("error");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-12">
      {/* ============ IDENTITY ============ */}
      <section className="space-y-7">
        <SectionHeading
          number="01"
          title="Identity Information"
          desc="How we should reach you to confirm the demo."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-7">
          <MotionInput
            placeholder="Your full name"
            autoComplete="name"
            leftIcon={<User className="w-4 h-4" />}
            disabled={isSubmitting}
            onChange={(v: string) =>
              setValue("fullName", v, { shouldValidate: true })
            }
            value={watch("fullName")}
            label="Full name *"
            error={fullNameError}
            reserveErrorLine
          />

          <MotionInput
            placeholder="Klola Indonesia"
            autoComplete="organization"
            leftIcon={<Building2 className="w-4 h-4" />}
            disabled={isSubmitting}
            onChange={(v: string) => setValue("companyName", v)}
            value={watch("companyName")}
            label="Company name"
            error={companyError}
            reserveErrorLine
          />

          <MotionInput
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            leftIcon={<Mail className="w-4 h-4" />}
            disabled={isSubmitting}
            onChange={(v: string) =>
              setValue("email", v, { shouldValidate: true })
            }
            value={watch("email")}
            label="Email *"
            error={emailError}
            reserveErrorLine
          />

          <MotionInput
            type="tel"
            placeholder="+62 812-3456-7890"
            autoComplete="tel"
            leftIcon={<Phone className="w-4 h-4" />}
            disabled={isSubmitting}
            onChange={(v: string) => setValue("phone", v)}
            value={watch("phone")}
            label="Phone number"
            error={phoneError}
            reserveErrorLine
          />
        </div>
      </section>

      {/* ============ REQUEST ============ */}
      <section className="space-y-7">
        <SectionHeading
          number="02"
          title="Request Information"
          desc="Specifics help us tailor the walkthrough."
        />

        <div className="space-y-7">
          <MotionInput
            placeholder="e.g. Evaluate for our customer-support team"
            disabled={isSubmitting}
            onChange={(v: string) =>
              setValue("purpose", v, { shouldValidate: true })
            }
            value={watch("purpose")}
            label="Purpose of request *"
            error={purposeError}
            reserveErrorLine
          />

          <div>
            <Label htmlFor="questions" className="text-sm text-foreground/80">
              Questions or concerns
            </Label>
            <Textarea
              id="questions"
              rows={4}
              placeholder="Anything you'd like answered during the session"
              className="mt-2 resize-none"
              {...register("questions")}
            />
            {errors.questions && (
              <p className="mt-1.5 text-xs text-destructive">
                {errors.questions.message}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ============ SCHEDULING ============ */}
      <section className="space-y-7">
        <SectionHeading
          number="03"
          title="Scheduling"
          desc="We confirm by email."
        />

        <div className="space-y-7">
          {/* Preferred date */}
          <div>
            <Label className="text-sm text-foreground/80">
              Preferred date *
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  className={cn(
                    "mt-2 h-11 w-full justify-start gap-2 px-3 font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="w-4 h-4 shrink-0 text-muted-foreground" />
                  {date ? format(date, "EEEE, d MMMM yyyy") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) =>
                    setValue("date", d ?? new Date(), { shouldValidate: true })
                  }
                  disabled={(d) =>
                    d < new Date(new Date().setHours(0, 0, 0, 0)) ||
                    d.getDay() === 0
                  }
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.date.message}
              </p>
            )}
          </div>

          {/* Duration */}
          <div>
            <Label className="text-sm text-foreground/80">
              Demo length <span className="text-destructive">*</span>
            </Label>
            <MorphSelect
              value={duration}
              onValueChange={(v) => setValue("duration", v)}
            >
              <MorphSelectTrigger className="mt-2">
                <MorphSelectValue placeholder="Select a length" />
              </MorphSelectTrigger>
              <MorphSelectContent className="max-h-[240px] overflow-y-auto">
                {durations.map((d) => (
                  <MorphSelectItem key={d} value={d}>
                    {d}
                  </MorphSelectItem>
                ))}
              </MorphSelectContent>
            </MorphSelect>
            {errors.duration && (
              <p className="mt-1.5 text-xs text-destructive">
                {errors.duration.message}
              </p>
            )}
          </div>

          {/* Start time */}
          <div>
            <Label className="text-sm text-foreground/80">
              Preferred start time <span className="text-destructive">*</span>
            </Label>
            <MorphSelect
              value={startTime}
              onValueChange={(v) => setValue("startTime", v)}
            >
              <MorphSelectTrigger className="mt-2">
                <MorphSelectValue placeholder="Select a time (WIB)" />
              </MorphSelectTrigger>
              <MorphSelectContent className="max-h-[260px] overflow-y-auto">
                {timeSlots.map((t) => (
                  <MorphSelectItem key={t} value={t}>
                    {t} WIB
                  </MorphSelectItem>
                ))}
              </MorphSelectContent>
            </MorphSelect>
            {errors.startTime && (
              <p className="mt-1.5 text-xs text-destructive">
                {errors.startTime.message}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Turnstile */}
      <div className="pt-1">
        <Turnstile
          siteKey={TURNSTILE_SITE_KEY}
          onSuccess={(t) => setToken(t)}
          onExpire={() => setToken(null)}
          onError={() => setToken(null)}
          options={{
            theme: "light",
          }}
        />
      </div>

      {/* Result banners */}
      {result === "success" && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          Request received! Our team will confirm your demo slot within 1
          business day.
        </div>
      )}
      {result === "error" && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Something went wrong. Please try again or email us at
          helpdesk@klola.id.
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting || !token}
        className="w-full sm:w-auto"
      >
        <Clock className="w-4 h-4 mr-2" />
        {isSubmitting
          ? "Submitting…"
          : !token
            ? "Please wait..."
            : "Request demo"}
      </Button>
    </form>
  );
}
