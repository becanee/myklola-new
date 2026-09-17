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
import { ArrowLeft, ImageUp, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const CATEGORIES = ["General", "Account", "Incident", "Bussiness", "Payroll", "Helpdesk"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const;

interface ApiTicket {
  id: string;
  subject: string | null;
  category: string;
  priority: string;
  status: string;
  description: string | null;
  assign_to?: string | null;
  created_at?: string;
  updated_at?: string;
}

type UploadedTicketFile = {
  id: string;
  file: File;
  preview: string;
};

export default function EditTicketModule() {
  const params = useParams<{ id?: string }>();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [files, setFiles] = useState<UploadedTicketFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const { toasts, showToast, updateToast, dismissToast } = useAnimatedToastStack({
    defaultDuration: 3600,
    limit: 5,
  });

  const isValid = subject.trim() && category && description.trim() && priority;

  useEffect(() => {
    const id = params?.id;
    if (!id) {
      router.push("/tickets");
      return;
    }

    fetch("/api/v1/tickets")
      .then((res) => res.json())
      .then((json) => {
        if (!json.success || !Array.isArray(json.data)) {
          throw new Error(json.message || "Failed to load ticket data");
        }

        const ticket = json.data.find((row: ApiTicket) => row.id === id) as ApiTicket | undefined;
        if (!ticket) {
          router.push("/tickets");
          return;
        }

        setSubject(ticket.subject ?? "");
        setCategory(ticket.category ?? "General");
        setDescription(ticket.description ?? "");
        setPriority(ticket.priority ?? "Medium");
      })
      .catch((error) => {
        console.error("Failed to load ticket for edit:", error);
        router.push("/tickets");
      })
      .finally(() => setLoading(false));
  }, [params?.id, router]);

  const previews = useMemo(
    () =>
      files.map((file) => ({
        id: file.id,
        name: file.file.name,
        preview: file.preview,
      })),
    [files],
  );

  const validateAndAddFiles = (incoming: FileList | File[]) => {
    const incomingFiles = Array.from(incoming);
    const validFiles = incomingFiles.filter((file) => {
      const extension = "." + file.name.split(".").pop()?.toLowerCase();
      return [".png", ".jpg", ".jpeg", ".webp", ".svg"].includes(extension);
    });

    const nextFiles = validFiles.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    setFiles((prev) => [...prev, ...nextFiles]);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      validateAndAddFiles(event.target.files);
      event.target.value = "";
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    if (event.dataTransfer.files.length > 0) {
      validateAndAddFiles(event.dataTransfer.files);
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleSubmit = async () => {
    if (!isValid || submitting || !params?.id) return;

    setSubmitting(true);
    const loadingId = showToast({ status: "loading", title: "Menyimpan perubahan...", duration: 0 });

    try {
      const formData = new FormData();
      formData.append("subject", subject.trim());
      formData.append("category", category);
      formData.append("priority", priority);
      formData.append("description", description);

      for (const item of files) {
        formData.append("attachments", item.file);
      }

      const res = await fetch(`/api/v1/tickets/${params.id}`, {
        method: "PATCH",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Failed to update ticket");
      }

      updateToast(loadingId, {
        status: "success",
        title: "Perubahan tiket berhasil disimpan",
        duration: 3200,
      });

      router.push(`/tickets/${params.id}`);
    } catch (err) {
      updateToast(loadingId, {
        status: "error",
        title: "Gagal menyimpan tiket",
        description: err instanceof Error ? err.message : "Something went wrong",
        duration: 4200,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading ticket data...
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col">
      <HeaderComp title="Tickets" path="Management > Tickets > Edit" />

      <div className="mx-auto w-full flex-1 px-2 py-6 -mt-16">
        <div className="rounded-lg border border-border/40 bg-card p-6">
          <div className="space-y-5">
            <div className="flex justify-between border-b pb-4">
              <h1 className="text-lg font-bold text-primary">Edit</h1>
              <Link href={params?.id ? `/tickets/${params.id}` : "/tickets"}>
                <Button variant="secondary" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
            </div>

            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">Subject</span>
                <span className="text-[10px] text-muted-foreground/50 uppercase">required</span>
              </div>
              <Input placeholder="e.g. Payroll module not calculating overtime correctly" value={subject} onChange={setSubject} />
            </div>

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

            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">Description</span>
                <span className="text-[10px] text-muted-foreground/50 uppercase">required</span>
              </div>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="min-h-[200px] w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground/40 focus:ring-2 focus:ring-ring/40"
                placeholder="Describe the issue or request..."
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">Attachments</span>
                <span className="text-[10px] text-muted-foreground/50 uppercase">optional</span>
              </div>

              <div>
                <div
                  onDragOver={(event) => { event.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                  className={[
                    "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 transition-colors",
                    dragOver ? "border-primary/40 bg-primary/[0.03]" : "border-border/40 bg-background hover:border-border/60",
                  ].join(" ")}
                >
                  <div className="grid size-10 place-items-center rounded-full bg-muted">
                    <ImageUp className="size-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, WEBP, SVG &middot; max 5 images &middot; 10 MB total
                  </p>
                </div>

                <input
                  ref={inputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {previews.length > 0 && (
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {previews.map((preview) => (
                      <div key={preview.id} className="group relative aspect-square overflow-hidden rounded-lg border border-border/40 bg-muted">
                        <img
                          src={preview.preview}
                          alt={preview.name}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(preview.id)}
                          className="absolute right-0.5 top-0.5 grid size-5 place-items-center rounded-full bg-background/80 text-muted-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:text-foreground"
                          aria-label={`Remove ${preview.name}`}
                        >
                          <X className="size-3" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 truncate bg-gradient-to-t from-black/40 to-transparent px-1.5 pb-1 pt-4 text-[10px] text-white">
                          {preview.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">Priority</span>
                <span className="text-[10px] text-muted-foreground/50 uppercase">required</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {PRIORITIES.map((item) => {
                  const selected = priority === item;
                  return (
                    <label
                      key={item}
                      className={[
                        "relative cursor-pointer rounded-xl border p-3 text-center transition-all duration-150",
                        selected ? "border-amber-300 bg-amber-50 shadow-sm" : "border-border/60 bg-card hover:border-border/80",
                      ].join(" ")}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value={item}
                        checked={selected}
                        onChange={(event) => setPriority(event.target.value)}
                        className="sr-only"
                      />
                      <span className={selected ? "block text-sm font-medium text-foreground" : "block text-sm font-medium text-muted-foreground"}>
                        {item}
                      </span>
                      <span className={selected ? "mt-1 block text-[10px] uppercase tracking-wider text-foreground/50" : "mt-1 block text-[10px] uppercase tracking-wider text-muted-foreground/40"}>
                        {selected ? { Low: "Not urgent", Medium: "Soon", High: "ASAP", Urgent: "Now" }[item] : "Priority"}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-border/40 pt-5">
            <button
              type="button"
              disabled={!isValid || submitting}
              onClick={handleSubmit}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0B3464] px-5 text-sm font-medium text-white transition-all hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3464]/40 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {submitting ? "Saving..." : "Save changes"}
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
