import type { TaskDraft } from "@/lib/types";
import type { CreatedTask } from "@/components/workspace-redesign/CreatedTasksView";

export type Guest = {
  name: string;
  title?: string;
  initials: string;
};

export type Comment = {
  id: string;
  authorName: string;
  authorInitials: string;
  body: string;
  createdAt: string;
};

export type MeetingV2 = {
  id: string;
  title: string;
  /** e.g. "Monday - 06/22/2026 11:00 pm - 12:00 am" */
  scheduleLabel: string;
  /** e.g. "Monday of every week" */
  recurrenceLabel: string;
  clientName: string;
  guests: Guest[];
  agendaHtml: string;
  comments: Comment[];
  notes: string;
  savedTasks: CreatedTask[];
};

export type MeetingV2State = {
  notes: string;
  draftTasks: TaskDraft[];
  savedTasks: CreatedTask[];
};
