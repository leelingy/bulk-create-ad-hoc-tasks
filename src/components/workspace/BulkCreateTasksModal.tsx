"use client";

import { useCallback, useEffect, useState } from "react";
import type { Meeting, TaskDraft } from "@/lib/types";
import { CLIENTS, TENANT_USERS } from "@/lib/tenantUsers";
import { createMeeting } from "@/lib/meetingPersistence";
import {
  matchAssigneeFromLineWithNotes,
  matchUserFromCell,
} from "@/lib/matchAssignee";
import { matchClientFromCell } from "@/lib/matchClient";
import {
  defaultTsvColumnMap,
  normalizeBillTypeCell,
  parseTsvToMatrix,
  SPREADSHEET_COLUMN_ORDER_LABELS,
  splitNonEmptyLines,
} from "@/lib/bulkPaste";
import { normalizeBudgetedHoursToHHMM } from "@/lib/budgetedHoursFormat";
import { dateToISO, newDefaultBulkTaskRow, todayISODate } from "@/lib/bulkTaskDefaults";
import { BulkTaskDraftTable } from "./BulkTaskDraftTable";
import {
  levvyBtnPrimaryClass,
  levvyBtnPrimarySmClass,
  levvyBtnSecondaryClass,
  levvyFocusRingClass,
  levvyTabActiveClass,
  levvyTabInactiveClass,
  levvyTabListClass,
} from "./levvyModalTokens";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (meeting: Meeting) => void;
  meetingCount: number;
};

function normalizeDateCell(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(t)) return t.slice(0, 10);
  const ms = Date.parse(t);
  if (!Number.isNaN(ms)) return dateToISO(new Date(ms));
  return "";
}

function workspaceDayIndex(): number {
  const d = new Date();
  const dow = d.getDay();
  if (dow === 0 || dow === 6) return 2;
  return dow - 1;
}

function cellAt(row: string[], col: number | null): string {
  if (col === null) return "";
  return row[col] ?? "";
}

const DOC_PASTE_PLACEHOLDER = [
  "Put one action item per line (from a doc, meeting notes, etc.).",
  "Click Create a task per line— each line becomes a row with text in Notes.",
  "If someone's name appears in the first few words, we'll try to match them as Assignee.",
].join("\n");

const SHEET_PASTE_PLACEHOLDER = [
  "Paste from a spreadsheet with columns in the following order.",
  "",
  
  "Column order (do not paste header row):",
  SPREADSHEET_COLUMN_ORDER_LABELS.join(" "),
  "",
].join("\n");

export function BulkCreateTasksModal({
  open,
  onClose,
  onCreated,
  meetingCount,
}: Props) {
  const [pasteTab, setPasteTab] = useState<"doc" | "sheet" | "manual">("doc");
  const [docPaste, setDocPaste] = useState("");
  const [sheetPaste, setSheetPaste] = useState("");

  const [rows, setRows] = useState<TaskDraft[]>([newDefaultBulkTaskRow()]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setPasteTab("doc");
    setDocPaste("");
    setSheetPaste("");
    setRows([newDefaultBulkTaskRow()]);
    setError(null);
  }, [open]);

  const importSpreadsheetFromText = useCallback((text: string) => {
    setError(null);
    const trimmed = text.trim();
    if (!trimmed) {
      setError("Paste spreadsheet rows first.");
      return;
    }

    const matrix = parseTsvToMatrix(trimmed);
    if (matrix.length === 0) {
      setError("No rows found.");
      return;
    }

    const columnMap = defaultTsvColumnMap();
    const next: TaskDraft[] = [];

    for (const cells of matrix) {
      const taskName = cellAt(cells, columnMap.taskName).trim();
      if (!taskName) continue;

      const assigneeCell = cellAt(cells, columnMap.assignee);
      const matchedUser = matchUserFromCell(assigneeCell, TENANT_USERS);

      const clientCell = cellAt(cells, columnMap.client);
      const matchedClient = matchClientFromCell(clientCell);
      const clientNameValue = matchedClient
        ? matchedClient.name
        : clientCell.trim();

      const b = cellAt(cells, columnMap.budgetedHours).trim();
      const sd = normalizeDateCell(cellAt(cells, columnMap.startDate));
      const dc = cellAt(cells, columnMap.daysToComplete).trim();
      const wf = cellAt(cells, columnMap.workflow).trim();
      let instructionsRaw = "";
      let billRaw = "";
      if (cells.length >= 10) {
        billRaw = cellAt(cells, 8);
        instructionsRaw = cellAt(cells, 9);
      } else {
        billRaw = cellAt(cells, 8);
      }

      next.push({
        id: crypto.randomUUID(),
        taskName,
        notes: cellAt(cells, columnMap.notes),
        instructions: instructionsRaw,
        clientName: clientNameValue,
        assigneeId: matchedUser?.id ?? null,
        assigneeName: matchedUser?.name ?? null,
        budgetedHours: normalizeBudgetedHoursToHHMM(b || "01:00"),
        startDate: sd || todayISODate(),
        daysToComplete: dc || "1",
        workflow: wf,
        billType: normalizeBillTypeCell(billRaw),
      });
    }

    if (next.length === 0) {
      setError(
        "No rows with a task name were found. Check that Row 1 is data and columns are tab-separated.",
      );
      return;
    }

    setRows(next);
  }, []);

  const runSpreadsheetImport = () => {
    importSpreadsheetFromText(sheetPaste);
  };

  const generateFromDoc = () => {
    setError(null);
    const text = docPaste.trim();
    if (!text) {
      setError("Paste some text first.");
      return;
    }

    const lines = splitNonEmptyLines(text);
    if (lines.length === 0) {
      setError("No non-empty lines to process.");
      return;
    }

    const next: TaskDraft[] = lines.map((line) => {
      const { assignee, notes } = matchAssigneeFromLineWithNotes(
        line,
        TENANT_USERS,
      );
      return {
        id: crypto.randomUUID(),
        taskName: "",
        clientName: "",
        assigneeId: assignee?.id ?? null,
        assigneeName: assignee?.name ?? null,
        notes,
        instructions: "",
        budgetedHours: normalizeBudgetedHoursToHHMM("01:00"),
        startDate: todayISODate(),
        daysToComplete: "1",
        workflow: "",
        billType: "Billable" as const,
      };
    });
    setRows(next);
  };

  const resolveRowsForSave = (): TaskDraft[] => {
    const valid = rows.filter((r) => r.taskName.trim().length > 0);
    return valid.map((r) => ({
      ...r,
      clientName: r.clientName.trim(),
      assigneeId: r.assigneeId,
      assigneeName: r.assigneeName,
      budgetedHours: normalizeBudgetedHoursToHHMM(r.budgetedHours),
    }));
  };

  const buildMeetingNotes = (): string => {
    const parts: string[] = [];
    const d = docPaste.trim();
    const s = sheetPaste.trim();
    if (d) parts.push(`From document:\n${d}`);
    if (s) parts.push(`From spreadsheet:\n${s}`);
    return parts.join("\n\n---\n\n") || "Bulk-created tasks";
  };

  const submitBulk = () => {
    setError(null);
    const resolved = resolveRowsForSave();
    if (resolved.length === 0) {
      setError("Add at least one task with a name.");
      return;
    }
    const bad = resolved.some(
      (t) => !t.clientName.trim() || !t.assigneeId || !t.assigneeName,
    );
    if (bad) {
      setError(
        "Each task needs a client and assignee. Fill blank highlighted cells.",
      );
      return;
    }

    const meetingClient =
      resolved.find((t) => t.clientName.trim())?.clientName.trim() ||
      CLIENTS[0];

    const base = createMeeting(
      {
        title: `Bulk tasks · ${new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`,
        clientName: meetingClient,
        dayIndex: workspaceDayIndex(),
        startLabel: "09:00 am",
        endLabel: "10:00 am",
      },
      meetingCount,
    );
    const meeting: Meeting = {
      ...base,
      notes: buildMeetingNotes(),
      savedTasks: resolved,
    };
    onCreated(meeting);
    onClose();
  };

  if (!open) return null;

  const namedTaskCount = rows.filter((r) => r.taskName.trim().length > 0).length;
  const createTasksLabel =
    namedTaskCount === 0
      ? "Create tasks"
      : namedTaskCount === 1
        ? "Create 1 Task"
        : `Create ${namedTaskCount} Tasks`;

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close overlay"
        className="absolute inset-0 z-0 bg-slate-900/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative z-10 flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-[#DEE2E6] bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulk-create-title"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-[#DEE2E6] px-6 py-4">
          <div>
            <h2
              id="bulk-create-title"
              className="text-xl font-semibold text-slate-900"
            >
              Bulk create tasks
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            <section className="rounded-xl border border-[#DEE2E6] bg-white p-4 shadow-sm">
              <div
                role="tablist"
                aria-label="How to add tasks"
                className={levvyTabListClass}
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={pasteTab === "doc"}
                  onClick={() => setPasteTab("doc")}
                  className={
                    pasteTab === "doc" ? levvyTabActiveClass : levvyTabInactiveClass
                  }
                >
                  Paste from doc
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={pasteTab === "sheet"}
                  onClick={() => setPasteTab("sheet")}
                  className={
                    pasteTab === "sheet"
                      ? levvyTabActiveClass
                      : levvyTabInactiveClass
                  }
                >
                  Paste from spreadsheet
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={pasteTab === "manual"}
                  onClick={() => setPasteTab("manual")}
                  className={
                    pasteTab === "manual"
                      ? levvyTabActiveClass
                      : levvyTabInactiveClass
                  }
                >
                  Type manually
                </button>
              </div>

              {pasteTab === "doc" && (
                <div className="mt-4 space-y-3" role="tabpanel">
                  <div>
                    <label
                      htmlFor="bulk-doc-paste"
                      className="text-sm font-semibold text-slate-800"
                    >
                      Step 1: Paste text
                    </label>
                    <textarea
                      id="bulk-doc-paste"
                      value={docPaste}
                      onChange={(e) => setDocPaste(e.target.value)}
                      rows={8}
                      className={`mt-2 w-full rounded-xl border border-[#DEE2E6] bg-white p-3 text-sm text-slate-800 shadow-inner ${levvyFocusRingClass}`}
                      placeholder={DOC_PASTE_PLACEHOLDER}
                    />
                    <div className="mt-2 flex flex-wrap items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={generateFromDoc}
                        className={levvyBtnPrimarySmClass}
                      >
                        Create a task per line
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {pasteTab === "sheet" && (
                <div className="mt-4 space-y-3" role="tabpanel">
                  <div>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <label
                        htmlFor="bulk-sheet-paste"
                        className="text-sm font-semibold text-slate-800"
                      >
                        Step 1: Paste from spreadsheet (do not include header
                        row)
                      </label>
                      <a
                        href="/import-ad-hoc-tasks-template.csv"
                        download="Import Ad Hoc Tasks Template.csv"
                        className="text-sm font-medium text-[#c45a1a] underline-offset-2 hover:underline"
                      >
                        Download import template
                      </a>
                    </div>
                    <textarea
                      id="bulk-sheet-paste"
                      value={sheetPaste}
                      onChange={(e) => setSheetPaste(e.target.value)}
                      rows={12}
                      placeholder={SHEET_PASTE_PLACEHOLDER}
                      className={`mt-2 w-full rounded-xl border border-[#DEE2E6] bg-white p-3 text-sm text-slate-800 shadow-inner ${levvyFocusRingClass}`}
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={runSpreadsheetImport}
                        className={levvyBtnPrimarySmClass}
                      >
                        Import tasks
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div>
              {pasteTab !== "manual" && (
                <h3 className="text-sm font-semibold text-slate-900">
                  Step 2: Review Tasks
                </h3>
              )}
              <div className="mt-2">
                <BulkTaskDraftTable
                  rows={rows}
                  onChange={setRows}
                  globalClient=""
                  globalAssigneeId={null}
                  globalAssigneeName={null}
                />
              </div>
            </div>
          </div>
        </div>

        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-[#DEE2E6] bg-white px-6 py-4">
          <button
            type="button"
            className={levvyBtnSecondaryClass}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submitBulk}
            className={levvyBtnPrimaryClass}
          >
            {createTasksLabel}
          </button>
        </footer>
      </div>
    </div>
  );
}
