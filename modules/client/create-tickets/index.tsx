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
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import TiptapEditor from "./editor";
import PriorityRadio from "./priority-radio";
import FileUpload, { type UploadedFile } from "./upload";
import Link from "next/link";

const CATEGORIES = ["General", "Account", "Incident"];

export default function CreateTicketModule() {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const isValid = subject.trim() && category && description.trim() && priority;

  return (
    <div className="w-screen min-h-screen flex flex-col">
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
              disabled={!isValid}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[#0B3464] px-5 text-sm font-medium text-white transition-all hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3464]/40 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Submit ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
