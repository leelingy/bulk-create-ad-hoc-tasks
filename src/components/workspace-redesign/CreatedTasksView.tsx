"use client";

import { useState } from "react";
import type { TaskDraft } from "@/lib/types";
import { TaskDetailCard } from "./TaskDetailCard";

/**
 * Post-create view: shows the tasks that were created from a meeting as
 * workspace-style cards, grouped by client and then by status. Lets users
 * (especially on recurring meetings) reference what came out of the meeting.
 */

export type TaskStatus =
  | "Due"
  | "Not Started"
  | "In Progress"
  | "Approval Pending"
  | "Completed";

/** Newly created tasks start as "Not Started"; statuses below already exist for grouping over time. */
const STATUS_ORDER: TaskStatus[] = [
  "Due",
  "Not Started",
  "In Progress",
  "Approval Pending",
  "Completed",
];

const STATUS_BAR: Record<TaskStatus, string> = {
  Due: "bg-amber-500",
  "Not Started": "bg-[#FF7A00]",
  "In Progress": "bg-sky-500",
  "Approval Pending": "bg-violet-500",
  Completed: "bg-emerald-500",
};

export type CreatedTask = TaskDraft & { status: TaskStatus };

function formatDue(t: TaskDraft): string {
  const d = new Date(`${t.startDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "—";
  const days = parseInt(t.daysToComplete, 10) || 0;
  d.setDate(d.getDate() + days);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}`;
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

function CreatedTaskCard({
  task,
  onClick,
}: {
  task: CreatedTask;
  onClick?: () => void;
}) {
  const interactive = Boolean(onClick);
  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${
        interactive
          ? "cursor-pointer transition hover:border-[#FF7A00]/60 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]/40"
          : ""
      }`}
      title={interactive ? "View task" : undefined}
    >
      <div
        className={`flex items-center justify-between gap-2 px-3 py-2 text-xs font-semibold text-white ${STATUS_BAR[task.status]}`}
      >
        <span className="truncate">
          {task.status} · Due {formatDue(task)} · {task.budgetedHours}
        </span>
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 opacity-90" aria-hidden>
          <path
            fillRule="evenodd"
            d="M10 3c-4.418 0-8 2.91-8 6.5 0 1.61.72 3.08 1.92 4.21-.13.97-.48 1.86-1.02 2.6a.5.5 0 00.54.78c1.46-.36 2.6-.92 3.42-1.5.96.27 1.99.41 3.14.41 4.418 0 8-2.91 8-6.5S14.418 3 10 3z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div className="flex items-start justify-between gap-2 px-3 py-2.5">
        <div className="min-w-0">
          <div className="truncate font-semibold text-slate-900">
            {task.taskName || "Untitled task"}
          </div>
          <div className="truncate text-sm text-slate-500">
            {task.workflow.trim() || "Ad hoc Task"}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="text-xs font-medium tabular-nums text-slate-500">0/1</span>
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-orange-400 text-[10px] font-bold text-white"
            title={task.assigneeName ?? "Unassigned"}
          >
            {initials(task.assigneeName)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function CreatedTasksView({
  tasks,
  onViewMeetingSummary,
  onTaskDetailClose,
}: {
  tasks: CreatedTask[];
  onViewMeetingSummary?: () => void;
  onTaskDetailClose?: () => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const openTask = tasks.find((t) => t.id === openId) ?? null;

  // Group by client → status, preserving a stable client order (first seen).
  const clientOrder: string[] = [];
  const byClient = new Map<string, CreatedTask[]>();
  for (const t of tasks) {
    const key = t.clientName.trim() || "No client";
    if (!byClient.has(key)) {
      byClient.set(key, []);
      clientOrder.push(key);
    }
    byClient.get(key)!.push(t);
  }

  return (
    <div className="space-y-6">
      {clientOrder.map((client) => {
        const clientTasks = byClient.get(client)!;
        return (
          <section key={client} className="space-y-3">
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
              {client}
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                {clientTasks.length}
              </span>
            </h3>

            {STATUS_ORDER.map((status) => {
              const group = clientTasks.filter((t) => t.status === status);
              if (group.length === 0) return null;
              return (
                <div key={status} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${STATUS_BAR[status]}`} />
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {status}
                    </span>
                    <span className="text-xs text-slate-400">{group.length}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {group.map((t) => (
                      <CreatedTaskCard
                        key={t.id}
                        task={t}
                        onClick={() => setOpenId(t.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        );
      })}

      {openTask && (
        <TaskDetailCard
          task={openTask}
          onClose={() => {
            setOpenId(null);
            onTaskDetailClose?.();
          }}
          onViewMeetingSummary={
            onViewMeetingSummary
              ? () => {
                  setOpenId(null);
                  onViewMeetingSummary();
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
