"use client";

import type { CreatedTask } from "./CreatedTasksView";
import { stripMeetingSummaryFromNotes } from "@/lib/taskNotesMeetingLink";

/**
 * Read-only Levvy-style task detail card, shown when a user clicks a task in the
 * post-create view. Mirrors the live workspace task card (orange header, timer,
 * Scheduling / Time Tracking tabs, Instructions + Task Notes, Comments) so the
 * created task looks exactly like it does on the workspace.
 */

const CREATED_BY = "Lee Ling";

function formatDueDate(t: CreatedTask): string {
  const d = new Date(`${t.startDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "—";
  const days = parseInt(t.daysToComplete, 10) || 0;
  d.setDate(d.getDate() + days);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getFullYear()}`;
}

function initials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function EditIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M13.586 3.586a2 2 0 112.828 2.828l-8.5 8.5a1 1 0 01-.45.263l-3 .857a.5.5 0 01-.618-.618l.857-3a1 1 0 01.263-.45l8.5-8.5z" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4h4v4M8 16H4v-4M16 4l-5 5M4 16l5-5" />
    </svg>
  );
}

function NotesBody({ text }: { text: string }) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    return <p className="text-sm italic text-slate-400">No notes.</p>;
  }
  return (
    <ul className="space-y-1 text-sm text-slate-700">
      {lines.map((line, i) => (
        <li key={i}>{line.replace(/^[-•]\s*/, "· ")}</li>
      ))}
    </ul>
  );
}

export function TaskDetailCard({
  task,
  onClose,
  onViewMeetingSummary,
}: {
  task: CreatedTask;
  onClose: () => void;
  onViewMeetingSummary?: () => void;
}) {
  const workflow = task.workflow.trim() || "Ad hoc Task";
  const assignee = task.assigneeName ?? "Unassigned";
  const budgeted = task.budgetedHours || "00:00";

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close overlay"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label={task.taskName || "Task"}
      >
        {/* Header */}
        <header className="relative bg-[#FF7A00] px-6 py-4 text-white">
          <div className="absolute right-4 top-3 flex items-center gap-3 text-white/90">
            <button type="button" aria-label="Minimize" className="hover:text-white">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5"><rect x="4" y="9" width="12" height="1.6" rx="0.8" /></svg>
            </button>
            <button type="button" aria-label="Expand" className="hover:text-white">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4h4v4M16 4l-6 6" /><rect x="4" y="9" width="7" height="7" rx="1" /></svg>
            </button>
            <button type="button" onClick={onClose} aria-label="Close" className="hover:text-white">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path strokeLinecap="round" d="M5 5l10 10M15 5L5 15" /></svg>
            </button>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-4 pr-24">
            <div className="min-w-0">
              <h2 className="truncate text-xl font-semibold">
                {task.taskName || "Untitled task"}
              </h2>
              <p className="mt-0.5 text-sm text-white/90">{workflow}</p>
              <div className="mt-2 flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1.5">
                  Assignee: {assignee}
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-white/25 text-[9px] font-bold"
                    title={assignee}
                  >
                    {initials(task.assigneeName)}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  High Priority:
                  <span className="relative inline-flex h-4 w-8 items-center rounded-full bg-white/30">
                    <span className="absolute left-0.5 h-3 w-3 rounded-full bg-white" />
                  </span>
                </span>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-start gap-6 text-sm">
              <Stat label="Created By" value={CREATED_BY} />
              <Stat label="Budgeted hours" value={budgeted.replace(":", " : ")} />
              <Stat label={task.status} value="00 : 00 : 53" strong />
              <Stat label="Due Date" value={formatDueDate(task)} />
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto bg-white px-5 py-4 md:grid-cols-2">
          {/* Left column */}
          <div className="space-y-4">
            <div className="text-base font-semibold text-slate-900">
              {task.clientName.trim() || "No client"}
            </div>

            <Panel
              title="Instructions"
              body={
                task.instructions.trim() ? (
                  <NotesBody text={task.instructions} />
                ) : (
                  <p className="text-sm italic text-slate-400">No instructions.</p>
                )
              }
            />

            <Panel
              title="Task Notes"
              body={
                <>
                  <NotesBody text={stripMeetingSummaryFromNotes(task.notes)} />
                  {onViewMeetingSummary && (
                    <button
                      type="button"
                      onClick={onViewMeetingSummary}
                      className="mt-3 text-sm font-medium text-[#FF7A00] hover:underline"
                    >
                      View meeting summary
                    </button>
                  )}
                </>
              }
            />
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <div className="flex items-center gap-6 border-b border-slate-200 pb-1 text-sm">
              <span className="rounded-md bg-[#FFF4E6] px-3 py-1.5 font-bold text-[#FF7A00]">
                Scheduling
              </span>
              <span className="font-semibold text-[#FF7A00]">Time Tracking</span>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between">
                <DetailRow label="Task Title" value={task.taskName || "Untitled task"} />
                <span className="text-[#FF7A00]">
                  <EditIcon />
                </span>
              </div>
              <DetailRow label="Assignee:" value={assignee} />
              <DetailRow label="Require Approval:" value="No" />
              <DetailRow label="Budgeted Hours" value={budgeted} muted />
            </div>

            <div>
              <h3 className="mb-2 text-base font-semibold text-slate-900">Comments</h3>
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-orange-400 text-[10px] font-bold text-white">
                  {initials(CREATED_BY)}
                </span>
                <input
                  type="text"
                  placeholder="Type a comment"
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
                <button type="button" aria-label="Send" className="text-[#FF7A00]">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5"><path d="M2.5 10l15-7-7 15-2.2-5.6L2.5 10z" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-white px-5 py-3">
          <button
            type="button"
            className="rounded-lg bg-[#F1F3F5] px-4 py-2 text-sm font-bold text-slate-900 hover:bg-[#E9ECEF]"
          >
            Delete
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1 rounded-lg bg-[#FF7A00] px-4 py-2 text-sm font-bold text-white hover:bg-[#E66D00]"
            >
              Block
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path d="M5 12l5-5 5 5z" /></svg>
            </button>
            <button
              type="button"
              className="rounded-lg bg-[#FF7A00] px-5 py-2 text-sm font-bold text-white hover:bg-[#E66D00]"
            >
              Complete
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="leading-tight">
      <div className="text-xs text-white/80">{label}</div>
      <div className={strong ? "text-sm font-bold" : "text-sm"}>{value}</div>
    </div>
  );
}

function Panel({ title, body }: { title: string; body: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <div className="flex items-center gap-2 text-[#FF7A00]">
          <EditIcon />
          <ExpandIcon />
        </div>
      </div>
      {body}
    </div>
  );
}

function DetailRow({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="mt-3 first:mt-0">
      <div className="text-xs text-slate-400">{label}</div>
      <div className={`text-sm ${muted ? "text-slate-400" : "text-slate-800"}`}>
        {value}
      </div>
    </div>
  );
}
