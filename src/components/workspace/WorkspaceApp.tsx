"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import type { Meeting } from "@/lib/types";
import {
  createMeeting,
  loadMeetings,
  saveMeetings,
} from "@/lib/meetingPersistence";
import { TENANT_USERS } from "@/lib/tenantUsers";
import { MeetingModal } from "./MeetingModal";
import { CreateMeetingDialog } from "./CreateMeetingDialog";
import { BulkCreateTasksModal } from "./BulkCreateTasksModal";

const DAY_HEADERS = [
  { idx: 0, short: "Mon", date: "Mar 23" },
  { idx: 1, short: "Tue", date: "Mar 24" },
  { idx: 2, short: "Wed", date: "Mar 25", today: true },
  { idx: 3, short: "Thu", date: "Mar 26" },
  { idx: 4, short: "Fri", date: "Mar 27" },
];

const LANES = [
  { id: "meetings", title: "Meeting And My Tasks", kind: "meetings" as const },
  {
    id: "abc",
    title: "ABC Bookstore",
    kind: "cards" as const,
    cards: [
      {
        day: 0,
        title: "Check in with clie…",
        status: "Not Started",
        progress: "1/3",
        accent: "slate",
      },
      {
        day: 0,
        title: "Client Approval",
        status: "Due",
        progress: "2/3",
        accent: "orange",
      },
    ],
  },
  {
    id: "alert",
    title: "Global Solutions",
    kind: "cards" as const,
    cards: [
      {
        day: 2,
        title: "CFO Advisory review",
        status: "Not Started",
        progress: "1/4",
        accent: "purple",
      },
    ],
  },
  {
    id: "global",
    title: "Global Solutions",
    kind: "cards" as const,
    cards: [
      {
        day: 3,
        title: "Workflow activation",
        status: "Due",
        progress: "1/2",
        accent: "emerald",
      },
    ],
  },
  {
    id: "mfg",
    title: "Manufacturing Inc.",
    kind: "cards" as const,
    cards: [
      {
        day: 0,
        title: "Payroll report",
        status: "Not Started",
        progress: "0/3",
        accent: "slate",
      },
      {
        day: 4,
        title: "Update Levy Worksp…",
        status: "Due",
        progress: "1/5",
        accent: "orange",
      },
    ],
  },
];

export function WorkspaceApp() {
  const [meetings, setMeetings] = useState<Meeting[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [createSplitOpen, setCreateSplitOpen] = useState(false);

  useEffect(() => {
    setMeetings(loadMeetings());
  }, []);

  useEffect(() => {
    if (meetings) saveMeetings(meetings);
  }, [meetings]);

  const activeMeeting = useMemo(
    () => meetings?.find((m) => m.id === activeId) ?? null,
    [meetings, activeId],
  );

  const meetingsByDay = useMemo(() => {
    const map: Record<number, Meeting[]> = { 0: [], 1: [], 2: [], 3: [], 4: [] };
    if (!meetings) return map;
    for (const m of meetings) {
      map[m.dayIndex]?.push(m);
    }
    for (const k of Object.keys(map)) {
      map[Number(k)]?.sort((a, b) =>
        a.startLabel.localeCompare(b.startLabel, undefined, { numeric: true }),
      );
    }
    return map;
  }, [meetings]);

  if (!meetings) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f5f7] text-slate-600">
        Loading workspace…
      </div>
    );
  }

  const upsertMeeting = (m: Meeting) => {
    setMeetings((prev) => {
      if (!prev) return [m];
      const i = prev.findIndex((x) => x.id === m.id);
      if (i === -1) return [...prev, m];
      const next = [...prev];
      next[i] = m;
      return next;
    });
  };

  return (
    <div className="flex min-h-screen bg-[#f4f5f7] text-slate-900">
      <aside className="flex w-56 shrink-0 flex-col border-r border-slate-800/80 bg-[#1e2230] text-slate-100">
        <div className="border-b border-white/5 px-4 py-4 text-lg font-semibold tracking-tight">
          My Workspace
        </div>
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4 text-sm">
          <div>
            <p className="px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Explore
            </p>
            <ul className="mt-2 space-y-1 text-slate-300">
              <li className="rounded-md px-2 py-1 hover:bg-white/5">Home</li>
              <li className="rounded-md px-2 py-1 hover:bg-white/5">Calendar</li>
            </ul>
          </div>
          <div>
            <p className="px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Filters
            </p>
            <ul className="mt-2 space-y-1 text-slate-300">
              <li className="rounded-md px-2 py-1 hover:bg-white/5">
                Saved Filters
              </li>
            </ul>
          </div>
          <div>
            <p className="px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              People
            </p>
            <ul className="mt-2 space-y-2">
              {TENANT_USERS.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center gap-2 rounded-md px-2 py-1 text-slate-200 hover:bg-white/5"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-orange-400 text-xs font-bold text-white">
                    {u.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                  <span className="truncate">{u.name}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Clients
            </p>
            <ul className="mt-2 space-y-1 text-slate-300">
              <li className="rounded-md px-2 py-1 hover:bg-white/5">
                ABC Bookstore
              </li>
              <li className="rounded-md px-2 py-1 hover:bg-white/5">
                Global Solutions
              </li>
              <li className="rounded-md px-2 py-1 hover:bg-white/5">
                Manufacturing Inc.
              </li>
            </ul>
          </div>
        </nav>
        <div className="relative p-3">
          <div className="flex w-full overflow-hidden rounded-xl shadow-lg shadow-orange-900/30">
            <button
              type="button"
              onClick={() => {
                setCreateOpen(true);
                setCreateSplitOpen(false);
              }}
              className="min-w-0 flex-1 bg-orange-500 py-3 text-center text-sm font-semibold text-white hover:bg-orange-600"
            >
              Create Task
            </button>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={createSplitOpen}
              onClick={() => setCreateSplitOpen((o) => !o)}
              className="shrink-0 border-l border-orange-400/80 bg-orange-500 px-2.5 py-3 text-white hover:bg-orange-600"
              title="More create options"
            >
              <span className="sr-only">Open create menu</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          {createSplitOpen && (
            <>
              <button
                type="button"
                aria-label="Dismiss menu"
                className="fixed inset-0 z-[55] cursor-default"
                onClick={() => setCreateSplitOpen(false)}
              />
              <div
                role="menu"
                className="absolute bottom-full left-3 right-3 z-[56] mb-1 overflow-hidden rounded-lg border border-slate-700/40 bg-[#2a2f3e] py-1 text-sm shadow-xl"
              >
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full px-3 py-2.5 text-left font-medium text-white hover:bg-white/10"
                  onClick={() => {
                    setBulkOpen(true);
                    setCreateSplitOpen(false);
                  }}
                >
                  Bulk create task
                </button>
              </div>
            </>
          )}
          <p className="mt-2 px-1 text-center text-[10px] text-slate-500">
            Create adds a meeting; bulk opens the multi-task editor.
          </p>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-x-auto">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-[#f4f5f7]/95 px-6 py-4 backdrop-blur">
          <h1 className="text-2xl font-semibold text-slate-900">My Workspace</h1>
          <p className="text-sm text-slate-600">
            Demo week · Click a meeting card to paste notes and generate tasks.
          </p>
        </header>

        <div className="px-4 pb-10 pt-4">
          <div
            className="grid min-w-[880px] gap-0 rounded-2xl border border-slate-200 bg-white shadow-sm"
            style={{
              gridTemplateColumns: "200px repeat(5, minmax(0, 1fr))",
            }}
          >
            <div className="border-b border-r border-slate-100 bg-slate-50/80" />
            {DAY_HEADERS.map((d) => (
              <div
                key={d.idx}
                className="border-b border-slate-100 px-3 py-3 text-center text-sm"
              >
                <div
                  className={
                    d.today
                      ? "font-semibold text-orange-600"
                      : "font-medium text-slate-700"
                  }
                >
                  {d.short}
                  {d.today ? " · Today" : ""}
                </div>
                <div className="text-xs text-slate-500">{d.date}</div>
              </div>
            ))}

            {LANES.map((lane) => (
              <Fragment key={lane.id}>
                <div
                  key={`${lane.id}-label`}
                  className="flex items-center border-b border-r border-slate-100 bg-slate-50/50 px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  {lane.title}
                </div>
                {DAY_HEADERS.map((d) => (
                  <div
                    key={`${lane.id}-${d.idx}`}
                    className="min-h-[100px] border-b border-slate-100 bg-white p-2 align-top"
                  >
                    {lane.kind === "meetings" && (
                      <div className="flex flex-col gap-2">
                        {(meetingsByDay[d.idx] ?? []).map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setActiveId(m.id)}
                            className={`w-full rounded-lg border border-slate-200 bg-white p-2 text-left text-xs shadow-sm ring-1 ring-black/5 transition hover:ring-2 hover:ring-violet-300 ${
                              m.accent === "purple"
                                ? "border-t-2 border-t-violet-500"
                                : m.accent === "green"
                                  ? "border-t-2 border-t-emerald-500"
                                  : "border-t-2 border-t-orange-500"
                            }`}
                          >
                            <div className="font-medium text-slate-900">
                              {m.startLabel} - {m.endLabel}
                            </div>
                            <div className="line-clamp-2 text-[11px] text-slate-700">
                              {m.title}
                            </div>
                            <div className="mt-1 text-[11px] text-slate-500">
                              {m.clientName}
                            </div>
                            {m.savedTasks.length > 0 && (
                              <div className="mt-1 text-[10px] font-medium text-violet-700">
                                {m.savedTasks.length} saved task
                                {m.savedTasks.length === 1 ? "" : "s"}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                    {lane.kind === "cards" && (
                      <div className="flex flex-col gap-2">
                        {lane.cards
                          .filter((c) => c.day === d.idx)
                          .map((c) => (
                            <div
                              key={c.title}
                              className="rounded-lg border border-slate-200 bg-slate-50/80 p-2 text-xs shadow-sm"
                            >
                              <div
                                className={`mb-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                  c.status === "Due"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-slate-200 text-slate-700"
                                }`}
                              >
                                {c.status}
                              </div>
                              <div className="font-medium text-slate-900">
                                {c.title}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {c.progress}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </Fragment>
            ))}
          </div>
        </div>
      </main>

      <MeetingModal
        meeting={activeMeeting}
        open={Boolean(activeId)}
        onClose={() => setActiveId(null)}
        onSave={upsertMeeting}
      />

      <CreateMeetingDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(data) => {
          const m = createMeeting(data, meetings.length);
          setMeetings([...meetings, m]);
          setActiveId(m.id);
        }}
      />

      <BulkCreateTasksModal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        meetingCount={meetings.length}
        onCreated={(meeting) => {
          setMeetings([...meetings, meeting]);
          setActiveId(meeting.id);
        }}
      />
    </div>
  );
}
