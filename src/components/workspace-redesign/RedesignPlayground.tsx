"use client";

import { useState } from "react";
import type { TaskDraft } from "@/lib/types";
import { RedesignReviewModal, type Variant } from "./RedesignReviewModal";
import {
  SAMPLE_BULK_DOC_PASTE,
  SAMPLE_MEETING_NOTES,
  sampleDraftTasks,
} from "./sampleMeeting";

type Flow = "meeting" | "bulk";

type OpenState = { flow: Flow; variant: Variant } | null;

const FLOW_CONFIG: Record<
  Flow,
  { title: string; sourceLabel: string; source: string; client: string }
> = {
  meeting: {
    title: "Monthly Check-in",
    sourceLabel: "Meeting notes",
    source: SAMPLE_MEETING_NOTES,
    client: "ABC Bookstore",
  },
  bulk: {
    title: "Bulk create tasks",
    sourceLabel: "Pasted source",
    source: SAMPLE_BULK_DOC_PASTE,
    client: "ABC Bookstore",
  },
};

export function RedesignPlayground() {
  const [open, setOpen] = useState<OpenState>(null);
  // Fresh draft rows per launch so edits in one variant don't leak into the other.
  const [rows, setRows] = useState<TaskDraft[]>(sampleDraftTasks());

  const launch = (flow: Flow, variant: Variant) => {
    setRows(sampleDraftTasks());
    setOpen({ flow, variant });
  };

  const cfg = open ? FLOW_CONFIG[open.flow] : null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <header className="mb-2">
        <span className="rounded-full bg-[#FFF4E6] px-3 py-1 text-xs font-bold text-[#FF7A00]">
          Redesign preview
        </span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          Bigger notes for task review
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Two takes on the squished review table. Both replace the wide,
          horizontally-scrolling grid with a layout that gives Notes far more
          room. Open the same meeting in each and compare. This page is isolated
          from the live app — nothing here changes the current design.
        </p>
      </header>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <VariantCard
          variant="A"
          title="Task cards"
          points={[
            "Each task is its own card",
            "Full-width, auto-growing Notes box",
            "Metadata in a compact grid below — no horizontal scroll",
            "2-up on wide screens to keep scanning fast",
          ]}
          onOpenMeeting={() => launch("meeting", "A")}
          onOpenBulk={() => launch("bulk", "A")}
        />
        <VariantCard
          variant="B"
          title="Split reference"
          points={[
            "Original meeting notes pinned on the left (US-10)",
            "Task cards with big Notes on the right",
            "Edit tasks while referencing the source",
            "Best when you cross-check against the transcript",
          ]}
          onOpenMeeting={() => launch("meeting", "B")}
          onOpenBulk={() => launch("bulk", "B")}
        />
      </div>

      {open && cfg && (
        <RedesignReviewModal
          open
          onClose={() => setOpen(null)}
          variant={open.variant}
          title={cfg.title}
          sourceLabel={cfg.sourceLabel}
          initialSource={cfg.source}
          initialRows={rows}
          clientName={cfg.client}
        />
      )}
    </div>
  );
}

function VariantCard({
  variant,
  title,
  points,
  onOpenMeeting,
  onOpenBulk,
}: {
  variant: Variant;
  title: string;
  points: string[];
  onOpenMeeting: () => void;
  onOpenBulk: () => void;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-[#DEE2E6] bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF7A00] text-sm font-bold text-white">
          {variant}
        </span>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </div>
      <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-600">
        {points.map((p) => (
          <li key={p} className="flex gap-2">
            <span className="mt-0.5 text-[#FF7A00]">•</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-col gap-2">
        <button
          type="button"
          onClick={onOpenMeeting}
          className="rounded-lg bg-[#FF7A00] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#E66D00]"
        >
          Open meeting flow
        </button>
        <button
          type="button"
          onClick={onOpenBulk}
          className="rounded-lg border-2 border-[#FF7A00] bg-white px-4 py-2.5 text-sm font-bold text-[#FF7A00] hover:bg-[#FFF4E6]"
        >
          Open bulk-create flow
        </button>
      </div>
    </div>
  );
}
