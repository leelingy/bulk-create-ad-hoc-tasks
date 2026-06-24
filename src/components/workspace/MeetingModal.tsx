"use client";

import { useEffect, useRef, useState } from "react";
import type { Meeting, TaskDraft } from "@/lib/types";
import { parseActionItems } from "@/lib/parseActionItems";
import { matchAssigneeFromLine } from "@/lib/matchAssignee";
import { TENANT_USERS } from "@/lib/tenantUsers";
import { newDefaultBulkTaskRow } from "@/lib/bulkTaskDefaults";
import { appendMeetingSummaryLine } from "@/lib/taskNotesMeetingLink";
import { normalizeBudgetedHoursToHHMM } from "@/lib/budgetedHoursFormat";
import { TaskCardList } from "../workspace-redesign/TaskCard";
import {
  CreatedTasksView,
  type CreatedTask,
} from "../workspace-redesign/CreatedTasksView";
import { levvyBtnPrimaryClass, levvyBtnSecondaryClass } from "./levvyModalTokens";

type Tab = "agenda" | "guests" | "time" | "tasks";

type Props = {
  meeting: Meeting | null;
  open: boolean;
  onClose: () => void;
  onSave: (meeting: Meeting) => void;
};

export function MeetingModal({ meeting, open, onClose, onSave }: Props) {
  const [tab, setTab] = useState<Tab>("guests");
  const [notes, setNotes] = useState("");
  const [draftTasks, setDraftTasks] = useState<TaskDraft[]>([]);
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  /** Tasks tab: false = show created tasks grouped by client/status; true = editing the review cards. */
  const [editingTasks, setEditingTasks] = useState(false);
  /** Avoid resetting notes when parent re-renders the same meeting after blur-save (new object reference). */
  const syncKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open || !meeting) {
      syncKeyRef.current = null;
      return;
    }
    const key = `${meeting.id}:${open}`;
    if (syncKeyRef.current === key) return;
    syncKeyRef.current = key;
    setNotes(meeting.notes);
    setDraftTasks(
      meeting.savedTasks.map((t) => ({
        ...t,
        clientName: t.clientName.trim() || meeting.clientName,
      })),
    );
    setTab("guests");
    setParsingError(null);
    // Reopening a meeting that already has tasks shows the grouped result first.
    setEditingTasks(meeting.savedTasks.length === 0);
  }, [meeting, open]);

  if (!open || !meeting) return null;

  const persistLocal = (patch: Partial<Meeting>) => {
    onSave({ ...meeting, ...patch });
  };

  const onNotesBlur = () => {
    persistLocal({ notes });
  };

  const generateFromNotes = async () => {
    setParsingError(null);
    const lines = parseActionItems(notes);
    if (lines.length === 0) {
      setParsingError(
        'No action items found. Add a section whose heading contains "Action item" (case insensitive), with bullet lines underneath.',
      );
      setDraftTasks([]);
      setEditingTasks(true);
      setTab("tasks");
      return;
    }

    setBusy(true);
    try {
      const next: TaskDraft[] = [];
      for (const line of lines) {
        const assignee = matchAssigneeFromLine(line, TENANT_USERS);
        const res = await fetch("/api/summarize-action-item", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: line }),
        });
        const data = (await res.json()) as {
          taskName?: string;
          error?: string;
          detail?: string;
        };
        if (!res.ok) {
          const hint = data.detail
            ? ` ${typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail)}`
            : "";
          throw new Error((data.error ?? "Summary request failed") + hint);
        }
        const taskName = data.taskName ?? line.slice(0, 80);
        next.push({
          ...newDefaultBulkTaskRow(),
          id: crypto.randomUUID(),
          taskName,
          clientName: meeting.clientName,
          assigneeId: assignee?.id ?? null,
          assigneeName: assignee?.name ?? null,
          notes: appendMeetingSummaryLine(`• ${line.trim()}`),
        });
      }
      setDraftTasks(next);
      setEditingTasks(true);
      setTab("tasks");
    } catch (e) {
      setParsingError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const createAllTasks = () => {
    const resolved = draftTasks
      .filter((t) => t.taskName.trim().length > 0)
      .map((t) => ({
        ...t,
        clientName: t.clientName.trim(),
        assigneeId: t.assigneeId,
        assigneeName: t.assigneeName,
        budgetedHours: normalizeBudgetedHoursToHHMM(t.budgetedHours),
      }));
    if (resolved.length === 0) {
      setParsingError("Add at least one task with a name.");
      return;
    }
    const bad = resolved.some(
      (t) => !t.clientName.trim() || !t.assigneeId || !t.assigneeName,
    );
    if (bad) {
      setParsingError(
        "Each task needs a client and assignee. Fill blank highlighted cells.",
      );
      return;
    }
    persistLocal({ notes, savedTasks: resolved });
    setParsingError(null);
    setEditingTasks(false);
  };

  const newReviewRow = (): TaskDraft => ({
    ...newDefaultBulkTaskRow(),
    clientName: meeting.clientName,
  });

  const editSavedTasks = () => {
    setDraftTasks(
      meeting.savedTasks.map((t) => ({
        ...t,
        clientName: t.clientName.trim() || meeting.clientName,
      })),
    );
    setEditingTasks(true);
  };

  const createdTasks: CreatedTask[] = meeting.savedTasks.map((t) => ({
    ...t,
    status: "Not Started",
  }));

  const accentBar =
    meeting.accent === "purple"
      ? "border-t-violet-500"
      : meeting.accent === "green"
        ? "border-t-emerald-500"
        : "border-t-orange-500";

  const namedTaskCount = draftTasks.filter(
    (r) => r.taskName.trim().length > 0,
  ).length;
  const createTasksLabel =
    namedTaskCount === 0
      ? "Create tasks"
      : namedTaskCount === 1
        ? "Create 1 Task"
        : `Create ${namedTaskCount} Tasks`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ${accentBar} border-t-4 ${
          tab === "tasks" ? "max-w-5xl" : "max-w-3xl"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-6 py-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold text-violet-800">
                {meeting.title}
              </h2>
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-800">
                00:00:00
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              {DAY_NAMES[meeting.dayIndex]} · {WEEK_LABEL}{" "}
              {meeting.startLabel} - {meeting.endLabel}{" "}
              <span className="rounded bg-orange-50 px-1.5 py-0.5 text-xs font-medium text-orange-800">
                Demo
              </span>
            </p>
            <p className="mt-2 text-base font-semibold text-slate-900">
              {meeting.clientName}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Edit"
            >
              ✎
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Close dialog"
            >
              ✕
            </button>
          </div>
        </header>

        <nav className="flex gap-6 border-b border-slate-100 px-6 text-sm font-medium">
          {(
            [
              ["agenda", "Agenda"],
              ["guests", "Guests and Notes"],
              ["time", "Time Tracking"],
              ["tasks", "Tasks"],
            ] as const
          ).map(([id, label]) => (
            <button
              type="button"
              key={id}
              onClick={() => setTab(id)}
              className={
                tab === id
                  ? "-mb-px border-b-2 border-orange-500 pb-3 text-orange-600"
                  : "pb-3 text-slate-500 hover:text-slate-800"
              }
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {tab === "agenda" && (
            <p className="text-sm text-slate-600">
              Demo agenda placeholder. Use{" "}
              <strong className="text-slate-800">Guests and Notes</strong> to
              paste AI output.
            </p>
          )}

          {tab === "guests" && (
            <div className="space-y-4">
              <details className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <summary className="cursor-pointer text-sm font-semibold text-slate-800">
                  Guests · 2 members
                </summary>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                  {TENANT_USERS.slice(0, 2).map((u) => (
                    <li key={u.id}>{u.name}</li>
                  ))}
                </ul>
              </details>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800">
                    Notes
                  </span>
                  <span className="text-xs text-slate-500">Click below and paste</span>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={onNotesBlur}
                  rows={12}
                  autoComplete="off"
                  spellCheck
                  className="relative z-10 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 shadow-inner focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-300"
                  placeholder="Paste meeting summary from your AI tool. Include a heading with “Action items” and bullet lines beneath it."
                />
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={!notes.trim() || busy}
                    onClick={generateFromNotes}
                    className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
                  >
                    {busy ? "Generating…" : "Create Task from Notes"}
                  </button>
                  {parsingError && tab === "guests" && (
                    <span className="text-sm text-red-600">{parsingError}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === "time" && (
            <p className="text-sm text-slate-600">
              Time tracking placeholder for demo.
            </p>
          )}

          {tab === "tasks" &&
            (!editingTasks && meeting.savedTasks.length > 0 ? (
              <div className="space-y-4">
                <CreatedTasksView
                  tasks={createdTasks}
                  onViewMeetingSummary={() => setTab("guests")}
                />
                <div className="flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={editSavedTasks}
                    className={levvyBtnSecondaryClass}
                  >
                    Edit tasks
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(240px,18rem)_1fr]">
                <aside className="md:sticky md:top-0 md:self-start">
                  <div className="flex max-h-[60vh] flex-col overflow-hidden rounded-xl border border-violet-200 bg-violet-50/40">
                    <div className="border-b border-violet-100 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-violet-900">
                      Meeting notes
                      <span className="ml-1 font-normal normal-case text-violet-500">
                        (reference)
                      </span>
                    </div>
                    <pre className="flex-1 overflow-auto whitespace-pre-wrap px-4 py-3 text-xs leading-relaxed text-slate-700">
                      {notes.trim() || "— No notes pasted yet —"}
                    </pre>
                  </div>
                </aside>

                <div className="min-w-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Review tasks
                    </h3>
                    <span className="text-xs text-slate-500">
                      Grouped by assignee + workflow · {namedTaskCount} ready
                    </span>
                  </div>

                  {parsingError && (
                    <p className="text-sm text-red-600">{parsingError}</p>
                  )}

                  <TaskCardList
                    rows={draftTasks}
                    onChange={setDraftTasks}
                    disabled={busy}
                    newRow={newReviewRow}
                    onViewMeetingSummary={() => setTab("guests")}
                  />

                  <div className="flex flex-wrap items-center justify-end gap-3">
                    {meeting.savedTasks.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setEditingTasks(false)}
                        className={levvyBtnSecondaryClass}
                      >
                        View created tasks
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={createAllTasks}
                      className={levvyBtnPrimaryClass}
                    >
                      {createTasksLabel}
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>

        <footer className="border-t border-slate-100 px-6 py-3">
          <button
            type="button"
            className="text-sm font-medium text-red-600 hover:underline"
            onClick={onClose}
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;
const WEEK_LABEL = "Mar 23–27, 2026";
