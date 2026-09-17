"use client";

import { Button } from "@/components/motion/button/base";
import { Input } from "@/components/motion/input";
import {
  MorphSelect,
  MorphSelectContent,
  MorphSelectItem,
  MorphSelectTrigger,
  MorphSelectValue,
} from "@/components/motion/select-morph";
import { Search, SquarePen, X } from "lucide-react";
import Link from "next/link";

const STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "Open", label: "Open" },
  { value: "Pending", label: "Pending" },
  { value: "Action Required", label: "Action Required" },
  { value: "Investigate", label: "Investigate" },
  { value: "Resolved", label: "Resolved" },
  { value: "Closed", label: "Closed" },
] as const;

const CATEGORY_OPTIONS = [
  { value: "all", label: "Semua Kategori" },
  { value: "General", label: "General" },
  { value: "Account", label: "Account" },
  { value: "Incident", label: "Incident" },
  { value: "Business", label: "Business" },
  { value: "Payroll", label: "Payroll" },
  { value: "Helpdesk", label: "Helpdesk" },
] as const;

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  categoryFilter: string;
  onCategoryChange: (v: string) => void;
}

export default function FilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
}: FilterBarProps) {
  const hasFilters =
    searchQuery || statusFilter !== "all" || categoryFilter !== "all";

  const clearAll = () => {
    onSearchChange("");
    onStatusChange("all");
    onCategoryChange("all");
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search */}
      <div className="w-full sm:max-w-xs">
        <Input
          placeholder="Cari tiket..."
          value={searchQuery}
          onChange={onSearchChange}
          leftIcon={<Search className="size-4 text-muted-foreground" />}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/tickets/create">
          <Button variant="primary" size="md">
            Create Ticket
            <SquarePen  className="h-4 w-4" />
          </Button>
        </Link>

        <MorphSelect value={statusFilter} onValueChange={onStatusChange}>
          <MorphSelectTrigger>
            <MorphSelectValue placeholder="Semua Status" />
          </MorphSelectTrigger>
          <MorphSelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <MorphSelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </MorphSelectItem>
            ))}
          </MorphSelectContent>
        </MorphSelect>

        <MorphSelect value={categoryFilter} onValueChange={onCategoryChange}>
          <MorphSelectTrigger>
            <MorphSelectValue placeholder="Semua Kategori" />
          </MorphSelectTrigger>
          <MorphSelectContent>
            {CATEGORY_OPTIONS.map((opt) => (
              <MorphSelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </MorphSelectItem>
            ))}
          </MorphSelectContent>
        </MorphSelect>

        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Hapus filter"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
