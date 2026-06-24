import type { Meeting, TaskDraft } from "./types";

const STORAGE_KEY = "workspace-meetings-v1";

const ACCENTS: Meeting["accent"][] = ["orange", "purple", "green"];

function nextAccent(index: number): Meeting["accent"] {
  return ACCENTS[index % ACCENTS.length];
}

/** Initial / SSR-safe meetings for the demo week. */
export function seedMeetings(): Meeting[] {
  return [
    {
      id: "seed-wed-client-review",
      title: "Client review",
      clientName: "ABC Bookstore",
      dayIndex: 2,
      startLabel: "08:30 am",
      endLabel: "09:30 am",
      notes: "",
      savedTasks: [],
      accent: "purple",
    },
    {
      id: "seed-mon-abc",
      title: "Meeting with organizing team",
      clientName: "ABC Bookstore",
      dayIndex: 0,
      startLabel: "01:00 pm",
      endLabel: "02:00 pm",
      notes: "",
      savedTasks: [],
      accent: "orange",
    },
    {
      id: "seed-fri-mfg-a",
      title: "Quarterly planning",
      clientName: "Manufacturing Inc.",
      dayIndex: 4,
      startLabel: "10:00 am",
      endLabel: "11:00 am",
      notes: "",
      savedTasks: [],
      accent: "green",
    },
    {
      id: "seed-fri-mfg-b",
      title: "Vendor sync",
      clientName: "Manufacturing Inc.",
      dayIndex: 4,
      startLabel: "02:00 pm",
      endLabel: "03:00 pm",
      notes: "",
      savedTasks: [],
      accent: "orange",
    },
  ];
}

function normalizeTaskDraft(t: Partial<TaskDraft> & { id?: string }): TaskDraft {
  return {
    id: typeof t.id === "string" ? t.id : crypto.randomUUID(),
    taskName: typeof t.taskName === "string" ? t.taskName : "",
    clientName: typeof t.clientName === "string" ? t.clientName : "",
    assigneeId: t.assigneeId ?? null,
    assigneeName: t.assigneeName ?? null,
    notes: typeof t.notes === "string" ? t.notes : "",
    instructions:
      typeof t.instructions === "string" ? t.instructions : "",
    budgetedHours: typeof t.budgetedHours === "string" ? t.budgetedHours : "",
    startDate: typeof t.startDate === "string" ? t.startDate : "",
    daysToComplete: typeof t.daysToComplete === "string" ? t.daysToComplete : "",
    workflow: typeof t.workflow === "string" ? t.workflow : "",
    billType: typeof t.billType === "string" ? t.billType : "",
  };
}

function normalizeMeeting(m: Partial<Meeting> & { id?: string }): Meeting {
  const accent =
    m.accent === "purple" || m.accent === "green" ? m.accent : "orange";
  return {
    id: typeof m.id === "string" ? m.id : crypto.randomUUID(),
    title: typeof m.title === "string" ? m.title : "Untitled",
    clientName:
      typeof m.clientName === "string" ? m.clientName : "ABC Bookstore",
    dayIndex:
      typeof m.dayIndex === "number" &&
      m.dayIndex >= 0 &&
      m.dayIndex <= 4
        ? m.dayIndex
        : 0,
    startLabel:
      typeof m.startLabel === "string" ? m.startLabel : "09:00 am",
    endLabel: typeof m.endLabel === "string" ? m.endLabel : "10:00 am",
    notes: typeof m.notes === "string" ? m.notes : "",
    savedTasks: Array.isArray(m.savedTasks)
      ? m.savedTasks.map((t) => normalizeTaskDraft(t as TaskDraft))
      : [],
    accent,
  };
}

export function loadMeetings(): Meeting[] {
  if (typeof window === "undefined") return seedMeetings();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = seedMeetings();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return seedMeetings();
    return parsed.map((m) => normalizeMeeting(m as Meeting));
  } catch {
    return seedMeetings();
  }
}

export function saveMeetings(meetings: Meeting[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings));
}

export function createMeeting(partial: {
  title: string;
  clientName: string;
  dayIndex: number;
  startLabel: string;
  endLabel: string;
}, index: number): Meeting {
  return {
    id: crypto.randomUUID(),
    title: partial.title,
    clientName: partial.clientName,
    dayIndex: partial.dayIndex,
    startLabel: partial.startLabel,
    endLabel: partial.endLabel,
    notes: "",
    savedTasks: [],
    accent: nextAccent(index),
  };
}
