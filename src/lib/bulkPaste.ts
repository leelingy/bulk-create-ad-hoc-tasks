export type TsvField =
  | "taskName"
  | "notes"
  | "client"
  | "assignee"
  | "workflow"
  | "budgetedHours"
  | "startDate"
  | "daysToComplete"
  | "billType"
  | "instructions";

export const TSV_FIELD_LABELS: Record<TsvField, string> = {
  taskName: "Task name",
  notes: "Notes (optional)",
  client: "Client",
  assignee: "Assignee",
  workflow: "Workflow (optional)",
  budgetedHours: "Budgeted Hours (HH:MM)",
  startDate: "Start date",
  daysToComplete: "Days to complete",
  billType: "Billable type",
  instructions: "Instructions (optional)",
};

/** Same order as `defaultTsvColumnMap` indices — matches BulkTaskDraftTable data columns. */
export const SPREADSHEET_COLUMN_ORDER_LABELS: string[] = [
  TSV_FIELD_LABELS.taskName,
  TSV_FIELD_LABELS.notes,
  TSV_FIELD_LABELS.client,
  TSV_FIELD_LABELS.assignee,
  TSV_FIELD_LABELS.workflow,
  TSV_FIELD_LABELS.budgetedHours,
  TSV_FIELD_LABELS.startDate,
  TSV_FIELD_LABELS.daysToComplete,
  TSV_FIELD_LABELS.billType,
  TSV_FIELD_LABELS.instructions,
];

export const TSV_FIELDS_ORDER: TsvField[] = [
  "taskName",
  "notes",
  "client",
  "assignee",
  "workflow",
  "budgetedHours",
  "startDate",
  "daysToComplete",
  "billType",
  "instructions",
];

/**
 * Positional map for spreadsheet paste: columns left-to-right match the bulk table
 * (… days, billable type, instructions). Legacy 9-column rows use index 8 as bill only.
 */
export function defaultTsvColumnMap(): Record<TsvField, number | null> {
  return {
    taskName: 0,
    notes: 1,
    client: 2,
    assignee: 3,
    workflow: 4,
    budgetedHours: 5,
    startDate: 6,
    daysToComplete: 7,
    billType: 8,
    instructions: 9,
  };
}

/** Maps a pasted cell to Billable | Non-Billable; empty defaults to Billable. */
export function normalizeBillTypeCell(raw: string): "Billable" | "Non-Billable" {
  const t = raw.trim().toLowerCase().replace(/\s+/g, " ");
  if (!t) return "Billable";
  if (t === "non-billable" || t === "non billable" || t === "nonbillable") {
    return "Non-Billable";
  }
  if (t.includes("non") && t.includes("bill")) return "Non-Billable";
  return "Billable";
}

export function splitNonEmptyLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0)
    .map((l) => l.trim());
}

export function parseTsvToMatrix(text: string): string[][] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  return lines.map((line) => line.split("\t").map((c) => c.trim()));
}

export function maxColumnCount(matrix: string[][]): number {
  return matrix.reduce((m, row) => Math.max(m, row.length), 0);
}
