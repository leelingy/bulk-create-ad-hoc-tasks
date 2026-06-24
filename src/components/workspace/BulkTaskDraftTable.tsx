"use client";

import { useMemo, useState } from "react";
import type { TaskDraft, TenantUser } from "@/lib/types";
import { CLIENTS, TENANT_USERS, WORKFLOWS } from "@/lib/tenantUsers";
import { normalizeBudgetedHoursToHHMM } from "@/lib/budgetedHoursFormat";
import { newDefaultBulkTaskRow } from "@/lib/bulkTaskDefaults";
import { levvyBtnOutlineSmClass } from "./levvyModalTokens";

type Props = {
  rows: TaskDraft[];
  onChange: (rows: TaskDraft[]) => void;
  disabled?: boolean;
  globalClient: string;
  globalAssigneeId: string | null;
  globalAssigneeName: string | null;
  /** Prefills `clientName` on new rows (e.g. meeting modal). */
  defaultClientName?: string;
};

export function BulkTaskDraftTable({
  rows,
  onChange,
  disabled,
  globalClient,
  globalAssigneeId,
  globalAssigneeName,
  defaultClientName,
}: Props) {
  const [showBillType, setShowBillType] = useState(false);

  const newRowWithDefaults = (): TaskDraft => {
    const base = newDefaultBulkTaskRow();
    const d = defaultClientName?.trim();
    return d ? { ...base, clientName: d } : base;
  };

  const update = (id: string, patch: Partial<TaskDraft>) => {
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const addRow = () => {
    onChange([...rows, newRowWithDefaults()]);
  };

  const removeRow = (id: string) => {
    if (rows.length <= 1) {
      onChange([newRowWithDefaults()]);
      return;
    }
    onChange(rows.filter((r) => r.id !== id));
  };

  const clientMissing = (r: TaskDraft) =>
    !r.clientName.trim() && !globalClient.trim();
  const assigneeMissing = (r: TaskDraft) =>
    !r.assigneeId && !globalAssigneeId;

  const taskNameMissing = (r: TaskDraft) => !r.taskName.trim();

  const missingCls = "ring-2 ring-amber-300/80 bg-amber-50/60";

  const textareaLike =
    "w-full resize-y rounded border border-slate-200 px-1 py-1 text-sm focus:border-violet-300 focus:outline-none";

  const fillClientToRowsBelow = (sourceId: string) => {
    const idx = rows.findIndex((r) => r.id === sourceId);
    if (idx === -1) return;
    const source = rows[idx];
    onChange(
      rows.map((r, i) =>
        i > idx ? { ...r, clientName: source.clientName } : r,
      ),
    );
  };

  const fillAssigneeToRowsBelow = (sourceId: string) => {
    const idx = rows.findIndex((r) => r.id === sourceId);
    if (idx === -1) return;
    const source = rows[idx];
    onChange(
      rows.map((r, i) =>
        i > idx
          ? {
              ...r,
              assigneeId: source.assigneeId,
              assigneeName: source.assigneeName,
            }
          : r,
      ),
    );
  };

  /** Row # (w-10) + delete (w-9) = 4.75rem — task name sticks after both. */
  const stickyRowNumTh =
    "sticky left-0 z-30 w-10 border-r border-slate-200 bg-slate-50 px-1 py-2 text-center shadow-[2px_0_6px_-2px_rgba(15,23,42,0.08)]";
  const stickyRowNumTd =
    "sticky left-0 z-20 w-10 border-r border-slate-200 bg-white px-1 py-1.5 text-center align-top shadow-[2px_0_6px_-2px_rgba(15,23,42,0.06)]";
  const stickyDeleteTh =
    "sticky left-10 z-30 w-9 border-r border-slate-200 bg-slate-50 px-1 py-2 shadow-[2px_0_6px_-2px_rgba(15,23,42,0.08)]";
  const stickyDeleteTd =
    "sticky left-10 z-20 w-9 border-r border-slate-200 bg-white px-1 py-1.5 shadow-[2px_0_6px_-2px_rgba(15,23,42,0.06)]";
  const stickyTaskTh =
    "sticky left-[4.75rem] z-30 min-w-[160px] border-r border-slate-200 bg-slate-50 px-3 py-2 shadow-[2px_0_6px_-2px_rgba(15,23,42,0.08)]";
  const stickyTaskTd =
    "sticky left-[4.75rem] z-20 min-w-[160px] border-r border-slate-200 bg-white px-2 py-1.5 shadow-[2px_0_6px_-2px_rgba(15,23,42,0.06)]";

  return (
    <div className="space-y-3">
      <div className="flex w-full flex-wrap items-center justify-end">
        <button
          type="button"
          onClick={() => setShowBillType((s) => !s)}
          className="shrink-0 text-sm font-medium text-[#c45a1a] underline-offset-2 hover:underline"
        >
          {showBillType
            ? "Hide billable type and Instructions"
            : "Show billable type and Instructions"}
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[1200px] w-full border-separate border-spacing-0 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className={`${stickyRowNumTh} align-bottom`} scope="col">
                #
              </th>
              <th
                className={`${stickyDeleteTh} align-bottom`}
                aria-label="Row actions"
              >
                <span className="sr-only">Delete</span>
              </th>
              <th className={`${stickyTaskTh} align-bottom`}>Task name</th>
              <th className="px-3 py-2 min-w-[160px]">Notes (optional)</th>
              <th className="px-3 py-2 min-w-[130px]">Client</th>
              <th className="px-3 py-2 min-w-[130px]">Assignee</th>
              <th className="px-3 py-2 min-w-[120px]">Workflow (optional)</th>
              <th className="w-[4.75rem] whitespace-normal px-1 py-2 align-bottom text-center leading-tight">
                <span className="block">Budgeted</span>
                <span className="block">Hours</span>
                <span className="mt-0.5 block font-mono text-[10px] font-semibold normal-case tracking-wide text-slate-500">
                  HH:MM
                </span>
              </th>
              <th className="w-20 whitespace-normal px-2 py-2 align-bottom text-center leading-tight">
                <span className="block">Start</span>
                <span className="block">Date</span>
              </th>
              <th className="w-20 whitespace-normal px-2 py-2 align-bottom text-center leading-tight">
                <span className="block">Days to</span>
                <span className="block">Complete</span>
              </th>
              {showBillType && (
                <>
                  <th className="px-3 py-2 w-28">Billable type</th>
                  <th className="px-3 py-2 min-w-[160px]">Instructions (optional)</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r, rowIndex) => (
              <tr key={r.id} className="bg-white">
                <td
                  className={`${stickyRowNumTd} align-top font-mono text-sm tabular-nums text-slate-500`}
                >
                  {rowIndex + 1}
                </td>
                <td className={`${stickyDeleteTd} align-top`}>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => removeRow(r.id)}
                    title="Delete row"
                    aria-label="Delete row"
                    className="inline-flex h-8 w-8 items-center justify-center rounded text-slate-400 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                      aria-hidden
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.37 41.37 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </td>
                <td
                  className={`${stickyTaskTd} align-top ${taskNameMissing(r) ? missingCls : ""} rounded-sm`}
                >
                  <textarea
                    value={r.taskName}
                    onChange={(e) =>
                      update(r.id, { taskName: e.target.value })
                    }
                    disabled={disabled}
                    rows={2}
                    className={textareaLike}
                    placeholder="Required"
                  />
                </td>
                <td className="px-2 py-1.5 align-top">
                  <textarea
                    value={r.notes}
                    onChange={(e) => update(r.id, { notes: e.target.value })}
                    disabled={disabled}
                    rows={2}
                    className={textareaLike}
                  />
                </td>
                <td
                  className={`px-2 py-1.5 align-top ${clientMissing(r) ? missingCls : ""} rounded-sm`}
                >
                  <ClientCell
                    row={r}
                    disabled={disabled}
                    onChange={(p) => update(r.id, p)}
                    onFillDownBelow={
                      rowIndex < rows.length - 1 && !disabled
                        ? () => fillClientToRowsBelow(r.id)
                        : undefined
                    }
                  />
                </td>
                <td
                  className={`px-2 py-1.5 align-top ${assigneeMissing(r) ? missingCls : ""} rounded-sm`}
                >
                  <AssigneeCell
                    row={r}
                    disabled={disabled}
                    onChange={(p) => update(r.id, p)}
                    onFillDownBelow={
                      rowIndex < rows.length - 1 && !disabled
                        ? () => fillAssigneeToRowsBelow(r.id)
                        : undefined
                    }
                  />
                </td>
                <td className="px-2 py-1.5 align-top">
                  <WorkflowCell
                    row={r}
                    disabled={disabled}
                    onChange={(p) => update(r.id, p)}
                  />
                </td>
                <td className="px-1 py-1.5 align-top w-[4.75rem]">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="01:00"
                    autoComplete="off"
                    value={r.budgetedHours}
                    onChange={(e) =>
                      update(r.id, { budgetedHours: e.target.value })
                    }
                    onBlur={() =>
                      update(r.id, {
                        budgetedHours: normalizeBudgetedHoursToHHMM(
                          r.budgetedHours,
                        ),
                      })
                    }
                    disabled={disabled}
                    className="w-full max-w-[4.75rem] rounded border border-slate-200 px-1 py-1 font-mono text-sm tabular-nums"
                  />
                </td>
                <td className="px-2 py-1.5 align-top w-20">
                  <input
                    type="date"
                    value={r.startDate}
                    onChange={(e) =>
                      update(r.id, { startDate: e.target.value })
                    }
                    disabled={disabled}
                    className="box-border w-full min-w-0 rounded border border-slate-200 px-0.5 py-1 text-xs"
                  />
                </td>
                <td className="px-2 py-1.5 align-top w-20">
                  <input
                    type="number"
                    min={0}
                    value={r.daysToComplete}
                    onChange={(e) =>
                      update(r.id, { daysToComplete: e.target.value })
                    }
                    disabled={disabled}
                    className="w-full max-w-[3.25rem] rounded border border-slate-200 px-1 py-1 text-sm"
                  />
                </td>
                {showBillType && (
                  <>
                    <td className="px-2 py-1.5 align-top">
                      <select
                        value={
                          r.billType === "Non-Billable"
                            ? "Non-Billable"
                            : "Billable"
                        }
                        onChange={(e) =>
                          update(r.id, { billType: e.target.value })
                        }
                        disabled={disabled}
                        className="w-full min-w-0 rounded border border-slate-200 bg-white px-1 py-1 text-sm focus:border-violet-300 focus:outline-none"
                      >
                        <option value="Billable">Billable</option>
                        <option value="Non-Billable">Non-Billable</option>
                      </select>
                    </td>
                    <td className="px-2 py-1.5 align-top min-w-[160px]">
                      <textarea
                        value={r.instructions}
                        onChange={(e) =>
                          update(r.id, { instructions: e.target.value })
                        }
                        disabled={disabled}
                        rows={2}
                        className={textareaLike}
                      />
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={addRow}
        disabled={disabled}
        className={`${levvyBtnOutlineSmClass} w-full text-center`}
      >
        Add another task
      </button>
    </div>
  );
}

function ClientCell({
  row,
  disabled,
  onChange,
  onFillDownBelow,
}: {
  row: TaskDraft;
  disabled?: boolean;
  onChange: (p: Partial<TaskDraft>) => void;
  onFillDownBelow?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(row.clientName);

  const suggestions = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [...CLIENTS].slice(0, 8);
    return CLIENTS.filter((c) => c.toLowerCase().includes(needle));
  }, [q]);

  const hasClient = row.clientName.trim().length > 0;

  return (
    <div className="flex flex-col gap-1">
      <div className="relative min-w-0 flex-1">
        <input
          value={open ? q : row.clientName}
          onFocus={() => {
            setOpen(true);
            setQ(row.clientName);
          }}
          onChange={(e) => {
            setQ(e.target.value);
            onChange({ clientName: e.target.value });
            setOpen(true);
          }}
          onBlur={() => {
            setTimeout(() => setOpen(false), 120);
          }}
          disabled={disabled}
          className={`w-full rounded border border-slate-200 py-1 text-sm focus:border-violet-300 focus:outline-none ${hasClient ? "pl-1 pr-7" : "px-1"}`}
        />
        <InputClearButton
          visible={hasClient && !disabled}
          label="Clear client"
          onClear={() => {
            onChange({ clientName: "" });
            setQ("");
          }}
        />
        {open && !disabled && (
          <ul className="absolute z-20 mt-1 max-h-40 w-64 overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg">
            {suggestions.map((c) => (
              <li key={c}>
                <button
                  type="button"
                  className="flex w-full px-3 py-1.5 text-left hover:bg-violet-50"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange({ clientName: c });
                    setQ(c);
                    setOpen(false);
                  }}
                >
                  {c}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {onFillDownBelow && (
        <FillDownTextButton
          disabled={disabled}
          onClick={onFillDownBelow}
          ariaLabel="Apply this client to rows below"
        />
      )}
    </div>
  );
}

function AssigneeCell({
  row,
  disabled,
  onChange,
  onFillDownBelow,
}: {
  row: TaskDraft;
  disabled?: boolean;
  onChange: (p: Partial<TaskDraft>) => void;
  onFillDownBelow?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const suggestions = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return TENANT_USERS.slice(0, 6);
    return TENANT_USERS.filter(
      (u: TenantUser) =>
        u.name.toLowerCase().includes(needle) ||
        u.email.toLowerCase().includes(needle),
    );
  }, [q]);

  const display = row.assigneeName ?? "";
  const hasAssignee = !!row.assigneeId || !!row.assigneeName?.trim();

  return (
    <div className="flex flex-col gap-1">
      <div className="relative min-w-0 flex-1">
        <input
          value={open ? q : display}
          onFocus={() => {
            setOpen(true);
            setQ(display);
          }}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onBlur={() => {
            setTimeout(() => setOpen(false), 120);
          }}
          disabled={disabled}
          className={`w-full rounded border border-slate-200 py-1 text-sm focus:border-violet-300 focus:outline-none ${hasAssignee ? "pl-1 pr-7" : "px-1"}`}
        />
        <InputClearButton
          visible={hasAssignee && !disabled}
          label="Clear assignee"
          onClear={() => {
            onChange({ assigneeId: null, assigneeName: null });
            setQ("");
          }}
        />
        {open && !disabled && (
          <ul className="absolute z-20 mt-1 max-h-40 w-56 overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg">
            {suggestions.map((u: TenantUser) => (
              <li key={u.id}>
                <button
                  type="button"
                  className="flex w-full px-3 py-1.5 text-left font-medium text-slate-900 hover:bg-violet-50"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange({ assigneeId: u.id, assigneeName: u.name });
                    setQ("");
                    setOpen(false);
                  }}
                >
                  {u.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {onFillDownBelow && (
        <FillDownTextButton
          disabled={disabled}
          onClick={onFillDownBelow}
          ariaLabel="Apply this assignee to rows below"
        />
      )}
    </div>
  );
}

function InputClearButton({
  visible,
  label,
  onClear,
}: {
  visible: boolean;
  label: string;
  onClear: () => void;
}) {
  if (!visible) return null;
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClear}
      className="absolute right-1 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4"
        aria-hidden
      >
        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
      </svg>
    </button>
  );
}

function FillDownTextButton({
  disabled,
  onClick,
  ariaLabel,
}: {
  disabled?: boolean;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="inline-flex shrink-0 items-center gap-1.5 self-start whitespace-nowrap text-left text-sm font-medium text-[#c45a1a] underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
    >
      Apply to rows below
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4 shrink-0"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );
}

function WorkflowCell({
  row,
  disabled,
  onChange,
}: {
  row: TaskDraft;
  disabled?: boolean;
  onChange: (p: Partial<TaskDraft>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(row.workflow);

  const suggestions = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = [...WORKFLOWS];
    if (!needle) return list;
    return list.filter((w) => w.toLowerCase().includes(needle));
  }, [q]);

  return (
    <div className="relative">
      <input
        value={open ? q : row.workflow}
        onFocus={() => {
          setOpen(true);
          setQ(row.workflow);
        }}
        onChange={(e) => {
          setQ(e.target.value);
          onChange({ workflow: e.target.value });
          setOpen(true);
        }}
        onBlur={() => {
          setTimeout(() => setOpen(false), 120);
        }}
        disabled={disabled}
        placeholder="Search…"
        className="w-full rounded border border-slate-200 px-1 py-1 text-sm focus:border-violet-300 focus:outline-none"
      />
      {open && !disabled && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-36 w-56 overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg">
          {suggestions.map((w) => (
            <li key={w}>
              <button
                type="button"
                className="w-full px-3 py-1.5 text-left hover:bg-violet-50"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange({ workflow: w });
                  setQ(w);
                  setOpen(false);
                }}
              >
                {w}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
