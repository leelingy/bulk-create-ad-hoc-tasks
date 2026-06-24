"use client";

import { useState } from "react";
import type { TaskDraft } from "@/lib/types";
import type { CreatedTask } from "@/components/workspace-redesign/CreatedTasksView";
import { TaskCardList } from "@/components/workspace-redesign/TaskCard";
import { CreatedTasksView } from "@/components/workspace-redesign/CreatedTasksView";
import { newDefaultBulkTaskRow } from "@/lib/bulkTaskDefaults";
import { normalizeBudgetedHoursToHHMM } from "@/lib/budgetedHoursFormat";
import {
  levvyBtnPrimaryClass,
  levvyBtnSecondaryClass,
} from "../workspace/levvyModalTokens";

type Props = {
  notes: string;
  clientName: string;
  draftTasks: TaskDraft[];
  savedTasks: CreatedTask[];
  editing: boolean;
  parseError: string | null;
  onDraftChange: (rows: TaskDraft[]) => void;
  onCreate: (rows: TaskDraft[]) => void;
  onViewCreated: () => void;
  onViewMeetingSummary?: () => void;
  onEnsureTasksTab?: () => void;
};

export function TasksTab({
  notes,
  clientName,
  draftTasks,
  savedTasks,
  editing,
  parseError,
  onDraftChange,
  onCreate,
  onViewCreated,
  onViewMeetingSummary,
  onEnsureTasksTab,
}: Props) {
  const [createError, setCreateError] = useState<string | null>(null);
  const newRow = () => ({ ...newDefaultBulkTaskRow(), clientName });

  const namedCount = draftTasks.filter((r) => r.taskName.trim().length > 0).length;
  const createLabel =
    namedCount === 0
      ? "Create tasks"
      : namedCount === 1
        ? "Create 1 task"
        : `Create ${namedCount} tasks`;

  const submit = () => {
    setCreateError(null);
    const resolved = draftTasks
      .filter((t) => t.taskName.trim().length > 0)
      .map((t) => ({
        ...t,
        clientName: t.clientName.trim(),
        budgetedHours: normalizeBudgetedHoursToHHMM(t.budgetedHours),
      }));
    if (resolved.length === 0) {
      setCreateError("Add at least one task with a name.");
      return;
    }
    const bad = resolved.some(
      (t) => !t.clientName.trim() || !t.assigneeId || !t.assigneeName,
    );
    if (bad) {
      setCreateError(
        "Each task needs a client and assignee. Fill the highlighted fields.",
      );
      return;
    }
    onCreate(resolved);
  };

  if (!editing && savedTasks.length > 0) {
    return (
      <CreatedTasksView
        tasks={savedTasks}
        onViewMeetingSummary={onViewMeetingSummary}
        onTaskDetailClose={onEnsureTasksTab}
      />
    );
  }

  return (
    <div className="grid min-h-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(240px,18rem)_1fr]">
      <aside className="lg:sticky lg:top-0 lg:self-start">
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
          <h3 className="text-sm font-semibold text-slate-900">Review tasks</h3>
        </div>

        {parseError && <p className="text-sm text-red-600">{parseError}</p>}
        <p className="text-xs text-slate-400">
          Only action items matched with a Levvy user will be extracted here as firm
          tasks.
        </p>

        <TaskCardList
          rows={draftTasks}
          onChange={onDraftChange}
          newRow={newRow}
          onViewMeetingSummary={onViewMeetingSummary}
        />

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#E8EAED] pt-3">
          {createError && (
            <p className="mr-auto text-sm font-medium text-red-600" role="alert">
              {createError}
            </p>
          )}
          {savedTasks.length > 0 && (
            <button
              type="button"
              className={levvyBtnSecondaryClass}
              onClick={onViewCreated}
            >
              View created tasks
            </button>
          )}
          <button type="button" className={levvyBtnPrimaryClass} onClick={submit}>
            {createLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
