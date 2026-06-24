"use client";

import { useState } from "react";
import type { TaskDraft } from "@/lib/types";
import { CLIENTS, TENANT_USERS, WORKFLOWS } from "@/lib/tenantUsers";
import { normalizeBudgetedHoursToHHMM } from "@/lib/budgetedHoursFormat";
import {
  appendMeetingSummaryLine,
  stripMeetingSummaryFromNotes,
} from "@/lib/taskNotesMeetingLink";
import { levvyBtnOutlineSmClass } from "../workspace/levvyModalTokens";
import { Combobox, Field, TaskNotesField, TextInput } from "./fieldPrimitives";

/**
 * Merge several task drafts into one (US-12). The `primary` task is kept as-is
 * (name, client, assignee, workflow, budgeted hours, dates); only its Notes are
 * replaced with the flat concatenation of every selected task's notes. Budgeted
 * hours are NOT summed — the primary's value stands.
 *
 * @param ordered  Selected tasks in their row order.
 * @param primary  The task whose fields are kept.
 */
function mergeDrafts(ordered: TaskDraft[], primary: TaskDraft): TaskDraft {
  const rest = ordered.filter((p) => p.id !== primary.id);
  const notes = appendMeetingSummaryLine(
    [primary, ...rest]
      .map((p) => stripMeetingSummaryFromNotes(p.notes.trim()))
      .filter(Boolean)
      .join("\n"),
  );
  return { ...primary, notes };
}

function taskLabel(row: TaskDraft, index: number): string {
  const name = row.taskName.trim();
  return name || `Task ${index + 1} (untitled)`;
}

const CLIENT_OPTIONS = [...CLIENTS];
const ASSIGNEE_OPTIONS = TENANT_USERS.map((u) => u.name);
const WORKFLOW_OPTIONS = [...WORKFLOWS];

type CardProps = {
  row: TaskDraft;
  index: number;
  disabled?: boolean;
  selected: boolean;
  isPrimary: boolean;
  onToggleSelect: () => void;
  onChange: (patch: Partial<TaskDraft>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onViewMeetingSummary?: () => void;
};

/**
 * A single task rendered as a card. The Notes area spans the full card width
 * and auto-grows, while the structured metadata sits in a compact grid below —
 * the opposite of the cramped single-row table cell.
 */
function TaskCard({
  row,
  index,
  disabled,
  selected,
  isPrimary,
  onToggleSelect,
  onChange,
  onDuplicate,
  onDelete,
  onViewMeetingSummary,
}: CardProps) {
  const taskNameMissing = !row.taskName.trim();
  const clientMissing = !row.clientName.trim();
  const assigneeMissing = !row.assigneeId && !row.assigneeName?.trim();

  return (
    <article
      className={`rounded-2xl border bg-white shadow-sm transition focus-within:shadow-md ${
        selected
          ? "border-[#FF7A00] ring-2 ring-[#FF7A00]/30"
          : "border-[#DEE2E6] focus-within:border-[#FF7A00]/50"
      }`}
    >
      <div className="flex items-start gap-3 border-b border-slate-100 px-4 py-3">
        <label className="mt-1 flex shrink-0 cursor-pointer items-center" title="Select to merge">
          <input
            type="checkbox"
            checked={selected}
            disabled={disabled}
            onChange={onToggleSelect}
            className="h-4 w-4 cursor-pointer rounded border-slate-300 text-[#FF7A00] accent-[#FF7A00] focus:ring-[#FF7A00]/30"
          />
        </label>
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
          {index + 1}
        </span>
        {isPrimary && (
          <span className="mt-1 shrink-0 rounded-full bg-[#FF7A00] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Keep
          </span>
        )}
        <div className="min-w-0 flex-1">
          <Field label="Task name" required>
            <TextInput
              value={row.taskName}
              disabled={disabled}
              placeholder="Required — e.g. Complete March month-close reconciliations"
              onChange={(e) => onChange({ taskName: e.target.value })}
              className={`text-[15px] font-semibold ${
                taskNameMissing
                  ? "border-amber-400 bg-amber-50/60 ring-2 ring-amber-300/60"
                  : ""
              }`}
            />
          </Field>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            disabled={disabled}
            onClick={onDuplicate}
            title="Duplicate task"
            aria-label="Duplicate task"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
              <path d="M7 3a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V5a2 2 0 00-2-2H7z" />
              <path d="M3 7a2 2 0 012-2v10a2 2 0 002 2h6a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" opacity="0.5" />
            </svg>
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            title="Delete task"
            aria-label="Delete task"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-700 disabled:opacity-40"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
              <path
                fillRule="evenodd"
                d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.37 41.37 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-4 px-4 py-4">
        <Field label="Notes" hint="action items captured from the meeting">
          <TaskNotesField
            value={row.notes}
            disabled={disabled}
            minRows={5}
            placeholder="One bullet per action item…"
            onChange={(v) => onChange({ notes: v })}
            onViewMeetingSummary={onViewMeetingSummary}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Field label="Client" required>
            <Combobox
              value={row.clientName}
              options={CLIENT_OPTIONS}
              placeholder="Search clients…"
              disabled={disabled}
              invalid={clientMissing}
              onPick={(c) => onChange({ clientName: c })}
              onType={(t) => onChange({ clientName: t })}
              onClear={() => onChange({ clientName: "" })}
            />
          </Field>

          <Field label="Assignee" required>
            <Combobox
              value={row.assigneeName ?? ""}
              display={row.assigneeName ?? ""}
              options={ASSIGNEE_OPTIONS}
              placeholder="Search people…"
              disabled={disabled}
              invalid={assigneeMissing}
              onPick={(name) => {
                const u = TENANT_USERS.find((x) => x.name === name);
                onChange({ assigneeId: u?.id ?? null, assigneeName: u?.name ?? name });
              }}
              onClear={() => onChange({ assigneeId: null, assigneeName: null })}
            />
          </Field>

          <Field label="Workflow" hint="optional">
            <Combobox
              value={row.workflow}
              options={WORKFLOW_OPTIONS}
              placeholder="Not linked"
              disabled={disabled}
              emptyToNone
              onPick={(w) => onChange({ workflow: w })}
              onType={(t) => onChange({ workflow: t })}
              onClear={() => onChange({ workflow: "" })}
            />
          </Field>

          <Field label="Budgeted hours" hint="HH:MM">
            <TextInput
              value={row.budgetedHours}
              inputMode="numeric"
              placeholder="01:00"
              disabled={disabled}
              onChange={(e) => onChange({ budgetedHours: e.target.value })}
              onBlur={() =>
                onChange({
                  budgetedHours: normalizeBudgetedHoursToHHMM(row.budgetedHours),
                })
              }
              className="font-mono tabular-nums"
            />
          </Field>

          <Field label="Start date">
            <TextInput
              type="date"
              value={row.startDate}
              disabled={disabled}
              onChange={(e) => onChange({ startDate: e.target.value })}
            />
          </Field>

          <Field label="Days to complete">
            <TextInput
              type="number"
              min={0}
              value={row.daysToComplete}
              disabled={disabled}
              onChange={(e) => onChange({ daysToComplete: e.target.value })}
            />
          </Field>
        </div>
      </div>
    </article>
  );
}

type ListProps = {
  rows: TaskDraft[];
  disabled?: boolean;
  onChange: (rows: TaskDraft[]) => void;
  newRow: () => TaskDraft;
  /** Optional 2-column card grid on wide layouts (Variant A). */
  twoUp?: boolean;
  onViewMeetingSummary?: () => void;
};

export function TaskCardList({
  rows,
  disabled,
  onChange,
  newRow,
  twoUp,
  onViewMeetingSummary,
}: ListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [keepId, setKeepId] = useState<string | null>(null);
  const selected = new Set(selectedIds.filter((id) => rows.some((r) => r.id === id)));

  // Selected tasks in row order, plus the effective "keep" target.
  const selectedRows = rows.filter((r) => selected.has(r.id));
  const effectiveKeepId =
    keepId && selected.has(keepId) ? keepId : (selectedRows[0]?.id ?? null);

  const update = (id: string, patch: Partial<TaskDraft>) =>
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const remove = (id: string) => {
    const next = rows.filter((r) => r.id !== id);
    setSelectedIds((ids) => ids.filter((x) => x !== id));
    onChange(next.length === 0 ? [newRow()] : next);
  };

  const duplicate = (id: string) => {
    const idx = rows.findIndex((r) => r.id === id);
    if (idx === -1) return;
    const copy: TaskDraft = { ...rows[idx], id: crypto.randomUUID() };
    onChange([...rows.slice(0, idx + 1), copy, ...rows.slice(idx + 1)]);
  };

  const toggleSelect = (id: string) =>
    setSelectedIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );

  const mergeSelected = () => {
    if (selectedRows.length < 2 || !effectiveKeepId) return;
    const primary = selectedRows.find((r) => r.id === effectiveKeepId);
    if (!primary) return;
    const merged = mergeDrafts(selectedRows, primary);
    const next: TaskDraft[] = [];
    for (const r of rows) {
      if (r.id === merged.id) next.push(merged);
      else if (!selected.has(r.id)) next.push(r);
    }
    onChange(next);
    setSelectedIds([]);
    setKeepId(null);
  };

  return (
    <div className="space-y-3">
      {selected.size >= 1 && (
        <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-xl border border-[#FF7A00]/40 bg-[#FFF4E6] px-3 py-2 shadow-sm">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-sm font-semibold text-[#9a4a00]">
              {selected.size} task{selected.size === 1 ? "" : "s"} selected
            </span>
            {selected.size >= 2 && (
              <label className="flex items-center gap-1.5 text-sm text-[#9a4a00]">
                <span className="font-medium">Keep</span>
                <select
                  value={effectiveKeepId ?? ""}
                  disabled={disabled}
                  onChange={(e) => setKeepId(e.target.value)}
                  className="min-w-[18rem] max-w-2xl rounded-md border border-[#FF7A00]/40 bg-white px-2 py-1 text-sm font-semibold text-slate-800 focus:border-[#FF7A00] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20"
                  title="This task's name, client, assignee, workflow, hours and dates are kept"
                >
                  {selectedRows.map((r) => (
                    <option key={r.id} value={r.id}>
                      {taskLabel(r, rows.findIndex((x) => x.id === r.id))}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={mergeSelected}
              disabled={disabled || selected.size < 2}
              className="rounded-lg bg-[#FF7A00] px-3 py-1.5 text-sm font-bold text-white shadow-sm hover:bg-[#E66D00] disabled:cursor-not-allowed disabled:opacity-50"
              title={
                selected.size < 2
                  ? "Select at least 2 tasks to merge"
                  : "Merge the others' notes into the kept task"
              }
            >
              Merge notes into kept task
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedIds([]);
                setKeepId(null);
              }}
              className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-white/60"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div
        className={
          twoUp
            ? "grid grid-cols-1 gap-3 xl:grid-cols-2"
            : "flex flex-col gap-3"
        }
      >
        {rows.map((r, i) => (
          <TaskCard
            key={r.id}
            row={r}
            index={i}
            disabled={disabled}
            selected={selected.has(r.id)}
            isPrimary={selected.size >= 2 && r.id === effectiveKeepId}
            onToggleSelect={() => toggleSelect(r.id)}
            onChange={(patch) => update(r.id, patch)}
            onDuplicate={() => duplicate(r.id)}
            onDelete={() => remove(r.id)}
            onViewMeetingSummary={onViewMeetingSummary}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...rows, newRow()])}
        disabled={disabled}
        className={`${levvyBtnOutlineSmClass} w-full`}
      >
        + Add another task
      </button>
    </div>
  );
}
