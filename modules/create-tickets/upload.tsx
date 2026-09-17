"use client";

import { useCallback, useRef, useState } from "react";
import { ImageUp, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".svg"];
const MAX_FILES = 5;
const MAX_TOTAL_BYTES = 10 * 1024 * 1024; // 10 MB

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  error?: string;
}

export default function FileUpload({
  files,
  onChange,
}: {
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const validateAndAdd = useCallback(
    (incoming: FileList | File[]) => {
      setGlobalError(null);
      const newFiles: UploadedFile[] = [];
      const errors: string[] = [];

      for (const file of Array.from(incoming)) {
        const ext = "." + file.name.split(".").pop()?.toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
          errors.push(`"${file.name}" — format tidak didukung.`);
          continue;
        }
        newFiles.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          file,
          preview: URL.createObjectURL(file),
        });
      }

      const combined = [...files, ...newFiles];
      const totalBytes = combined.reduce((sum, f) => sum + f.file.size, 0);

      if (combined.length > MAX_FILES) {
        errors.push(`Maksimal ${MAX_FILES} file.`);
      }
      if (totalBytes > MAX_TOTAL_BYTES) {
        errors.push(`Total ukuran melebihi 10 MB.`);
      }

      if (errors.length > 0) {
        setGlobalError(errors.join(" "));
        // Still add valid files up to limit
        const validCount = Math.min(newFiles.length, MAX_FILES - files.length);
        if (validCount > 0) {
          onChange([...files, ...newFiles.slice(0, validCount)]);
        }
        return;
      }

      onChange(combined);
    },
    [files, onChange],
  );

  const removeFile = useCallback(
    (id: string) => {
      onChange(files.filter((f) => f.id !== id));
    },
    [files, onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        validateAndAdd(e.dataTransfer.files);
      }
    },
    [validateAndAdd],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        validateAndAdd(e.target.files);
        e.target.value = "";
      }
    },
    [validateAndAdd],
  );

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 transition-colors",
          dragOver
            ? "border-primary/40 bg-primary/[0.03]"
            : "border-border/40 bg-background hover:border-border/60",
        )}
      >
        <div className="grid size-10 place-items-center rounded-full bg-muted">
          <ImageUp className="size-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-muted-foreground">
          PNG, JPG, WEBP, SVG &middot; max {MAX_FILES} images &middot; 10 MB total
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",") + ",.jpg,.jpeg"}
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Global error */}
      {globalError && (
        <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-destructive/[0.06] px-3 py-2 text-xs text-destructive">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          <span>{globalError}</span>
        </div>
      )}

      {/* File previews */}
      {files.length > 0 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {files.map((f) => (
            <div key={f.id} className="group relative aspect-square overflow-hidden rounded-lg border border-border/40 bg-muted">
              {f.file.type === "image/svg+xml" ? (
                <div className="flex h-full items-center justify-center p-2">
                  <img
                    src={f.preview}
                    alt={f.file.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : (
                <img
                  src={f.preview}
                  alt={f.file.name}
                  className="h-full w-full object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => removeFile(f.id)}
                className="absolute right-0.5 top-0.5 grid size-5 place-items-center rounded-full bg-background/80 text-muted-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:text-foreground"
                aria-label={`Remove ${f.file.name}`}
              >
                <X className="size-3" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 truncate bg-gradient-to-t from-black/40 to-transparent px-1.5 pb-1 pt-4 text-[10px] text-white">
                {f.file.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Count indicator */}
      {files.length > 0 && (
        <p className="mt-2 text-right text-[11px] text-muted-foreground">
          {files.length} / {MAX_FILES} files &middot;{" "}
          {(files.reduce((s, f) => s + f.file.size, 0) / 1024 / 1024).toFixed(1)} MB
        </p>
      )}
    </div>
  );
}

export type { UploadedFile };
