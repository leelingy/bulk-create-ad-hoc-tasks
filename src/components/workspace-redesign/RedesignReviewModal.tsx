"use client";

import { useEffect, useState } from "react";
import type { TaskDraft } from "@/lib/types";
import { normalizeBudgetedHoursToHHMM } from "@/lib/budgetedHoursFormat";
import { newDefaultBulkTaskRow } from "@/lib/bulkTaskDefaults";
import {
  levvyBtnPrimaryClass,
  levvyBtnSecondaryClass,
} from "../workspace/levvyModalTokens";
import { TaskCardList } from "./TaskCard";
import { CreatedTasksView, type CreatedTask } from "./CreatedTasksView";

export type Variant = "A" | "B";

type Props = {
  open: boolean;
  onClose: () => void;
  variant: Variant;
  /** Modal title, e.g. "Monthly Check-in" or "Bulk create tasks". */
  title: string;
  subtitle?: string;
  /** Label for the source/reference column, e.g. "Meeting notes". */
  sourceLabel: string;
  /** The original pasted text — shown for reference (US-10). */
  initialSource: string;
  initialRows: TaskDraft[];
  clientName: string;
};

const VARIANT_META: Record<Variant, { tag: string; blurb: string }> = {
  A: {
    tag: "Variant A · Task cards",
    blurb: "Every task is a card with a full-width, auto-growing Notes area.",
  },
  B: {
    tag: "Variant B · Split reference",
    blurb: "Original notes stay pinned on the left while you edit task cards.",
  },
};

function defaultRowFor(client: string): () => TaskDraft {
  return () => ({ ...newDefaultBulkTaskRow(), clientName: client });
}

export function RedesignReviewModal({
  open,
  onClose,
  variant,
  title,
  subtitle,
  sourceLabel,
  initialSource,
  initialRows,
  clientName,
}: Props) {
  const [source, setSource] = useState(initialSource);
  const [rows, setRows] = useState<TaskDraft[]>(initialRows);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedTask[] | null>(null);

  useEffect(() => {
    if (!open) return;
    setSource(initialSource);
    setRows(initialRows);
    setError(null);
    setCreated(null);
  }, [open, initialSource, initialRows]);

  if (!open) return null;

  const namedCount = rows.filter((r) => r.taskName.trim().length > 0).length;
  const createLabel =
    namedCount === 0
      ? "Create tasks"
      : namedCount === 1
        ? "Create 1 task"
        : `Create ${namedCount} tasks`;

  const submit = () => {
    setError(null);
    const resolved = rows
      .filter((r) => r.taskName.trim().length > 0)
      .map((r) => ({
        ...r,
        clientName: r.clientName.trim(),
        budgetedHours: normalizeBudgetedHoursToHHMM(r.budgetedHours),
      }));
    if (resolved.length === 0) {
      setError("Add at least one task with a name.");
      return;
    }
    const bad = resolved.some(
      (t) => !t.clientName.trim() || !t.assigneeId || !t.assigneeName,
    );
    if (bad) {
      setError("Each task needs a client and assignee. Fill the highlighted fields.");
      return;
    }
    setCreated(resolved.map((t) => ({ ...t, status: "Not Started" as const })));
  };

  const meta = VARIANT_META[variant];
  const isSplit = variant === "B";

  const sourcePanel = (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-[#DEE2E6] bg-slate-50/70">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {sourceLabel}
        </span>
        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
          reference
        </span>
      </div>
      <textarea
        value={source}
        onChange={(e) => setSource(e.target.value)}
        className="min-h-0 flex-1 resize-none rounded-b-2xl bg-transparent px-4 py-3 font-mono text-xs leading-relaxed text-slate-700 focus:outline-none"
        spellCheck={false}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close overlay"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative flex max-h-[94vh] w-full flex-col overflow-hidden rounded-2xl border border-[#DEE2E6] bg-white shadow-2xl ${
          isSplit ? "max-w-[78rem]" : "max-w-5xl"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-[#DEE2E6] px-6 py-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-xl font-semibold text-slate-900">{title}</h2>
              <span className="rounded-full bg-[#FFF4E6] px-2.5 py-0.5 text-xs font-bold text-[#FF7A00]">
                {meta.tag}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {created
                ? "Tasks created from this meeting — reference them anytime you reopen it."
                : (subtitle ?? meta.blurb)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        {created ? (
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
            <CreatedTasksView tasks={created} />
          </div>
        ) : isSplit ? (
          <div className="grid min-h-0 flex-1 grid-cols-[minmax(280px,22rem)_1fr] gap-4 overflow-hidden px-6 py-4">
            <div className="min-h-0 overflow-hidden py-1">{sourcePanel}</div>
            <div className="min-h-0 overflow-y-auto pr-1">
              <SectionHeading count={namedCount} />
              <TaskCardList
                rows={rows}
                onChange={setRows}
                newRow={defaultRowFor(clientName)}
              />
            </div>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
            <details className="mb-4 rounded-2xl border border-[#DEE2E6] bg-slate-50/70">
              <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-700">
                {sourceLabel} <span className="text-slate-400">(reference)</span>
              </summary>
              <div className="px-4 pb-4">{sourcePanel}</div>
            </details>
            <SectionHeading count={namedCount} />
            <TaskCardList
              rows={rows}
              onChange={setRows}
              newRow={defaultRowFor(clientName)}
              twoUp
            />
          </div>
        )}

        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-[#DEE2E6] bg-white px-6 py-4">
          {created ? (
            <>
              <div />
              <button type="button" className={levvyBtnPrimaryClass} onClick={onClose}>
                Done
              </button>
            </>
          ) : (
            <>
              <div className="min-w-0 text-sm">
                {error && <span className="font-medium text-red-600">{error}</span>}
              </div>
              <div className="flex items-center gap-3">
                <button type="button" className={levvyBtnSecondaryClass} onClick={onClose}>
                  Cancel
                </button>
                <button type="button" className={levvyBtnPrimaryClass} onClick={submit}>
                  {createLabel}
                </button>
              </div>
            </>
          )}
        </footer>
      </div>
    </div>
  );
}

function SectionHeading({ count }: { count: number }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-sm font-semibold text-slate-900">Review tasks</h3>
      <span className="text-xs text-slate-500">
        Grouped by assignee + workflow · {count} ready
      </span>
    </div>
  );
}
