"use client";

import { useState, type ReactNode } from "react";
import { ExpandIcon, PencilIcon } from "./icons";

type Props = {
  title: string;
  children: ReactNode;
  onEdit?: () => void;
  editLabel?: string;
  showEdit?: boolean;
  expandedMinHeight?: string;
};

/** White rounded card with title row, optional pencil + expand icons (screenshot style). */
export function SectionCard({
  title,
  children,
  onEdit,
  editLabel = "Edit",
  showEdit = false,
  expandedMinHeight = "12rem",
}: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="overflow-hidden rounded-xl border border-[#E8EAED] bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-[#F1F3F4] px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <div className="flex items-center gap-1">
          {showEdit && onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              aria-label={editLabel}
              title={editLabel}
            >
              <PencilIcon />
            </button>
          )}
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label={expanded ? "Collapse" : "Expand"}
            title={expanded ? "Collapse" : "Expand"}
          >
            <ExpandIcon />
          </button>
        </div>
      </div>
      <div
        className="px-4 py-4 transition-[min-height]"
        style={{ minHeight: expanded ? expandedMinHeight : undefined }}
      >
        {children}
      </div>
    </section>
  );
}
