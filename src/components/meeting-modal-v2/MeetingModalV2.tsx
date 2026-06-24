"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MeetingV2 } from "./types";
import type { TaskDraft } from "@/lib/types";
import type { CreatedTask } from "@/components/workspace-redesign/CreatedTasksView";
import { PencilIcon } from "./icons";
import { AgendaTab } from "./AgendaTab";
import { GuestsAndNotesTab } from "./GuestsAndNotesTab";
import { TimeTrackingTab } from "./TimeTrackingTab";
import { TasksTab } from "./TasksTab";
import { MessageClientModal } from "./MessageClientModal";
import { generateTasksFromNotes } from "./generateTasksFromNotes";
import {
  extractClientActionItems,
} from "@/lib/clientActionItems";
import { CLIENTS } from "@/lib/tenantUsers";

type Tab = "agenda" | "guests" | "time" | "tasks";

type Props = {
  meeting: MeetingV2;
  open: boolean;
  onClose: () => void;
  onMeetingChange?: (meeting: MeetingV2) => void;
};

export function MeetingModalV2({ meeting, open, onClose, onMeetingChange }: Props) {
  const [tab, setTab] = useState<Tab>("agenda");
  const [messageClientOpen, setMessageClientOpen] = useState(false);
  const [notes, setNotes] = useState(meeting.notes);
  const [editingNotes, setEditingNotes] = useState(false);
  const [draftTasks, setDraftTasks] = useState<TaskDraft[]>([]);
  const [savedTasks, setSavedTasks] = useState<CreatedTask[]>(meeting.savedTasks);
  const [editingTasks, setEditingTasks] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const hasTasksContext = draftTasks.length > 0 || savedTasks.length > 0;

  const clientActionItems = useMemo(
    () => extractClientActionItems(notes),
    [notes],
  );
  const clientOptions = useMemo(() => {
    const seen = new Set<string>();
    return [meeting.clientName, ...CLIENTS].filter((c) => {
      const key = c.trim();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [meeting.clientName]);
  const hasClientActionItems = clientActionItems.length > 0;
  /** Full reset only when opening a different meeting — not when notes save upstream. */
  const syncKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      syncKeyRef.current = null;
      return;
    }
    const key = `${meeting.id}:${open}`;
    if (syncKeyRef.current === key) return;
    syncKeyRef.current = key;

    setNotes(meeting.notes);
    setSavedTasks(meeting.savedTasks);
    setDraftTasks([]);
    setEditingNotes(false);
    setParseError(null);
    if (meeting.savedTasks.length > 0) {
      setTab("tasks");
      setEditingTasks(false);
    } else {
      setTab("agenda");
      setEditingTasks(false);
    }
  }, [meeting, open]);

  const tabs = useMemo(() => {
    const base: { id: Tab; label: string }[] = [
      { id: "agenda", label: "Agenda" },
      { id: "guests", label: "Guests and Notes" },
    ];
    if (hasTasksContext) {
      const count = editingTasks
        ? draftTasks.filter((t) => t.taskName.trim()).length || draftTasks.length
        : savedTasks.length;
      base.push({
        id: "tasks",
        label: count > 0 ? `Tasks (${count})` : "Tasks",
      });
    }
    base.push({ id: "time", label: "Time Tracking" });
    return base;
  }, [
    hasTasksContext,
    draftTasks,
    savedTasks,
    editingTasks,
  ]);

  const selectTab = (next: Tab) => {
    setTab(next);
  };

  const openMessageClient = () => {
    setMessageClientOpen(true);
  };

  const persist = (patch: Partial<MeetingV2>) => {
    onMeetingChange?.({ ...meeting, ...patch });
  };

  const handleSaveNotes = (next: string) => {
    setNotes(next);
    setEditingNotes(false);
    setParseError(null);
    persist({ notes: next });
  };

  const handleGenerateTasks = (sourceNotes: string) => {
    setParseError(null);
    const trimmed = sourceNotes.trim();
    if (!trimmed) {
      setParseError("Add notes first, then generate tasks.");
      return;
    }
    // Persist notes if generate is run from the editor before Save.
    if (trimmed !== notes.trim()) {
      setNotes(trimmed);
      persist({ notes: trimmed });
      setEditingNotes(false);
    }
    const { drafts, error } = generateTasksFromNotes(
      trimmed,
      meeting.clientName,
    );
    if (error) {
      setParseError(error);
      return;
    }
    setDraftTasks(drafts);
    setEditingTasks(true);
    setTab("tasks");
  };

  const handleCreateTasks = (rows: TaskDraft[]) => {
    const created: CreatedTask[] = rows.map((r) => ({
      ...r,
      status: "Not Started" as const,
    }));
    setSavedTasks(created);
    setDraftTasks(created);
    setEditingTasks(false);
    setParseError(null);
    persist({ notes, savedTasks: created });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close overlay"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl border border-[#E8EAED] bg-[#F8F9FA] shadow-2xl ${
          tab === "tasks" ? "max-w-5xl" : "max-w-2xl"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="meeting-v2-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Green accent bar */}
        <div className="absolute left-0 top-0 h-full w-1 bg-[#22C55E]" aria-hidden />

        <header className="shrink-0 border-b border-[#E8EAED] bg-[#F8F9FA] pl-5 pr-4 pt-5 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2
                id="meeting-v2-title"
                className="text-xl font-semibold text-slate-900"
              >
                {meeting.title}
              </h2>
              <p className="mt-1 text-sm text-slate-600">{meeting.scheduleLabel}</p>
              <p className="text-sm text-slate-500">{meeting.recurrenceLabel}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-700"
                aria-label="Edit meeting"
                title="Edit meeting"
              >
                <PencilIcon />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-700"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>
          <p className="mt-3 text-base font-semibold text-slate-900">
            {meeting.clientName}
          </p>
        </header>

        <nav
          className="flex shrink-0 flex-wrap gap-2 border-b border-[#E8EAED] bg-[#F8F9FA] px-5 py-3"
          aria-label="Meeting sections"
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => selectTab(t.id)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                tab === t.id
                  ? "bg-[#FFF4E6] text-[#FF7A00]"
                  : "text-[#FF7A00] hover:bg-[#FFF4E6]/60"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {tab === "agenda" && <AgendaTab agendaHtml={meeting.agendaHtml} />}
          {tab === "guests" && (
            <GuestsAndNotesTab
              guests={meeting.guests}
              notes={notes}
              editingNotes={editingNotes}
              parseError={parseError}
              onStartEdit={() => setEditingNotes(true)}
              onCancelEdit={() => setEditingNotes(false)}
              onSaveNotes={handleSaveNotes}
              onGenerateTasks={(sourceNotes) => handleGenerateTasks(sourceNotes)}
              onSendViaClientLoop={
                hasClientActionItems ? openMessageClient : undefined
              }
            />
          )}
          {tab === "time" && <TimeTrackingTab />}
          {tab === "tasks" && (
            <TasksTab
              notes={notes}
              clientName={meeting.clientName}
              draftTasks={draftTasks}
              savedTasks={savedTasks}
              editing={editingTasks}
              parseError={parseError}
              onDraftChange={setDraftTasks}
              onCreate={handleCreateTasks}
              onViewCreated={() => setEditingTasks(false)}
              onViewMeetingSummary={() => selectTab("guests")}
              onEnsureTasksTab={() => selectTab("tasks")}
            />
          )}
        </div>
      </div>

      <MessageClientModal
        open={messageClientOpen}
        meetingTitle={meeting.title}
        defaultClient={meeting.clientName}
        clientOptions={clientOptions}
        notes={notes}
        onClose={() => setMessageClientOpen(false)}
      />
    </div>
  );
}
