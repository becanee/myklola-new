"use client";

import HeaderComp from "@/components/header-comp";
import { Button } from "@/components/motion/button/base";
import { Input } from "@/components/motion/input";
import {
  MorphSelect,
  MorphSelectContent,
  MorphSelectItem,
  MorphSelectTrigger,
  MorphSelectValue,
} from "@/components/motion/select-morph";
import { useAnimatedToastStack, AnimatedToastStack } from "@/components/motion/animated-toast-stack";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import TiptapEditor from "./editor";
import PriorityRadio from "./priority-radio";
import FileUpload, { type UploadedFile } from "./upload";
import Link from "next/link";

const CATEGORIES = ['General', 'Account', 'Incident', 'Bussiness', 'Payroll', 'Helpdesk'];

export default function CreateTicketModule() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { toasts, showToast, updateToast, dismissToast } = useAnimatedToastStack({
    defaultDuration: 3600,
    limit: 5,
  });

  const isValid = subject.trim() && category && description.trim() && priority;

  const handleSubmit = async () => {
    if (!isValid || submitting) return;

    setSubmitting(true);
    const loadingId = showToast({ status: "loading", title: "Mengirim tiket...", duration: 0 });

    try {
      const formData = new FormData();
      formData.append("subject", subject.trim());
      formData.append("category", category);
      formData.append("priority", priority);
      formData.append("description", description);
      for (const f of files) {
        formData.append("attachments", f.file);
      }

      const res = await fetch("/api/v1/tickets", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Failed to create ticket");
      }

      updateToast(loadingId, {
        status: "success",
        title: "Tiket berhasil dibuat",
        duration: 3200,
      });

      router.push("/tickets");
    } catch (err) {
      updateToast(loadingId, {
        status: "error",
        title: "Gagal membuat tiket",
        description: err instanceof Error ? err.message : "Something went wrong",
        duration: 4200,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col">
      <HeaderComp title="Tickets" path="Management > Tickets > Create" />

      <div className="mx-auto w-full flex-1 px-2 py-6 -mt-16">
        {/* Form */}
        <div className="rounded-lg border border-border/40 bg-card p-6">
          <div className="space-y-5">
            <div className="flex justify-between border-b pb-4">
              <h1 className="text-lg font-bold text-primary">Create</h1>
              <Link href="/tickets">
                <Button variant="secondary" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
            </div>

            {/* Subject */}
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">Subject</span>
                <span className="text-[10px] text-muted-foreground/50 uppercase">required</span>
              </div>
              <Input
                placeholder="e.g. Payroll module not calculating overtime correctly"
                value={subject}
                onChange={setSubject}
              />
            </div>

            {/* Category */}
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">Category</span>
                <span className="text-[10px] text-muted-foreground/50 uppercase">required</span>
              </div>
              <MorphSelect value={category} onValueChange={setCategory}>
                <MorphSelectTrigger>
                  <MorphSelectValue placeholder="Select category" />
                </MorphSelectTrigger>
                <MorphSelectContent>
                  {CATEGORIES.map((cat) => (
                    <MorphSelectItem key={cat} value={cat}>
                      {cat}
                    </MorphSelectItem>
                  ))}
                </MorphSelectContent>
              </MorphSelect>
            </div>

            {/* Description */}
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">Description</span>
                <span className="text-[10px] text-muted-foreground/50 uppercase">required</span>
              </div>
              <TiptapEditor value={description} onChange={setDescription} />
            </div>

            {/* Attachments (optional) */}
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">Attachments</span>
                <span className="text-[10px] text-muted-foreground/50 uppercase">optional</span>
              </div>
              <FileUpload files={files} onChange={setFiles} />
            </div>

            {/* Priority */}
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">Priority</span>
                <span className="text-[10px] text-muted-foreground/50 uppercase">required</span>
              </div>
              <PriorityRadio value={priority} onChange={setPriority} />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-border/40 pt-5">
            <button
              type="button"
              disabled={!isValid || submitting}
              onClick={handleSubmit}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0B3464] px-5 text-sm font-medium text-white transition-all hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3464]/40 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {submitting ? "Submitting..." : "Submit ticket"}
            </button>
          </div>
        </div>
      </div>
      <AnimatedToastStack
        toasts={toasts}
        onDismiss={dismissToast}
        position="top-right"
        placement="fixed"
        maxVisible={4}
        classNames={{ surface: "bg-card/95 backdrop-blur-md" }}
      />
    </div>
  );
}
