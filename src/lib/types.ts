export type TenantUser = {
  id: string;
  name: string;
  email: string;
};

export type TaskDraft = {
  id: string;
  taskName: string;
  /** Per-row client; empty string means use bulk/global default from meeting context */
  clientName: string;
  assigneeId: string | null;
  assigneeName: string | null;
  notes: string;
  /** Extra guidance for the task (importable column; separate from Notes) */
  instructions: string;
  budgetedHours: string;
  startDate: string;
  daysToComplete: string;
  workflow: string;
  billType: string;
};

export type Meeting = {
  id: string;
  title: string;
  clientName: string;
  /** 0 = Monday … 4 = Friday for the demo week */
  dayIndex: number;
  startLabel: string;
  endLabel: string;
  notes: string;
  /** Tasks saved via "Create All Tasks" */
  savedTasks: TaskDraft[];
  accent: "orange" | "purple" | "green";
};
