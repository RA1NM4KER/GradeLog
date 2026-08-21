"use client";

import { MoreVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/shared/utils";

interface RowActionMenuItem {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  onSelect: () => void;
  tone?: "default" | "danger";
}

interface RowActionMenuProps {
  items: RowActionMenuItem[];
  label?: string;
  className?: string;
}

/** A lightweight, dependency-free "more actions" popover for list rows. */
export function RowActionMenu({
  items,
  label = "More actions",
  className,
}: RowActionMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className={cn("relative z-20", className)} ref={containerRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={label}
        className="flex h-9 w-9 items-center justify-center rounded-full text-ink-subtle transition hover:bg-surface-muted hover:text-ink-strong"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((current) => !current);
        }}
        type="button"
      >
        <MoreVertical className="h-4.5 w-4.5" />
      </button>
      {open ? (
        <div
          className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-2xl border border-line bg-surface p-1 shadow-card motion-safe:animate-ring-settle"
          role="menu"
        >
          {items.map((item) => (
            <button
              className={cn(
                "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-surface-muted",
                item.tone === "danger" ? "text-danger" : "text-foreground",
              )}
              key={item.id}
              onClick={(event) => {
                event.stopPropagation();
                setOpen(false);
                item.onSelect();
              }}
              role="menuitem"
              type="button"
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
