"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, PencilLine } from "lucide-react";

export type ActionDropdownItem = {
  label: string;
  icon?: React.ReactNode;
  onSelect?: () => void;
  destructive?: boolean;
  disabled?: boolean;
};

export function ActionDropdown({
  items,
  align = "end",
  className,
}: {
  items: ActionDropdownItem[];
  align?: "start" | "center" | "end";
  className?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={[
            "h-8 w-8 rounded-md border border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground",
            className,
          ].join(" ")}
          aria-label="Open ticket actions"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align} className="w-44">
        {items.map((item) => (
          <DropdownMenuItem
            key={item.label}
            disabled={item.disabled}
            variant={item.destructive ? "destructive" : "default"}
            onSelect={(event) => {
              event.preventDefault();
              item.onSelect?.();
            }}
            className="cursor-pointer"
          >
            <span className="flex items-center gap-2">
              {item.icon ?? null}
              {item.label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const TicketActionDropdown = ({
  onViewDetail,
  onEdit,
}: {
  onViewDetail?: () => void;
  onEdit?: () => void;
}) => (
  <ActionDropdown
    items={[
      {
        label: "Detail",
        icon: <Eye className="h-4 w-4" />,
        onSelect: onViewDetail,
      },
      {
        label: "Edit",
        icon: <PencilLine className="h-4 w-4" />,
        onSelect: onEdit,
      },
    ]}
  />
);
