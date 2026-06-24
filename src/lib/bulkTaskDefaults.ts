import type { TaskDraft } from "./types";

export function dateToISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISODate(): string {
  return dateToISO(new Date());
}

export function newDefaultBulkTaskRow(): TaskDraft {
  return {
    id: crypto.randomUUID(),
    taskName: "",
    clientName: "",
    assigneeId: null,
    assigneeName: null,
    notes: "",
    instructions: "",
    budgetedHours: "01:00",
    startDate: todayISODate(),
    daysToComplete: "1",
    workflow: "",
    billType: "Billable",
  };
}
