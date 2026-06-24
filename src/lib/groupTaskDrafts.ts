import type { TaskDraft } from "./types";
import { summarizeActionItem } from "./summarizeActionItem";
import { appendMeetingSummaryLine } from "./taskNotesMeetingLink";

function groupKey(draft: TaskDraft): string {
  const assignee = draft.assigneeId ?? draft.assigneeName ?? "";
  const workflow = draft.workflow.trim().toLowerCase() || "__none__";
  return `${assignee}|${workflow}`;
}

function mergeNotes(drafts: TaskDraft[]): string {
  return drafts
    .map((d) => d.notes.trim())
    .filter(Boolean)
    .map((n) => (n.startsWith("•") ? n : `• ${n}`))
    .join("\n");
}

function mergeTaskName(drafts: TaskDraft[]): string {
  const workflow = drafts[0]?.workflow ?? "";
  const combined = drafts
    .map((d) => d.notes.trim().replace(/^•\s*/, ""))
    .filter(Boolean)
    .join(" ");

  if (drafts.length > 1 && workflow === "Monthly close") {
    return "Complete month-close reconciliations";
  }

  return summarizeActionItem(combined);
}

/**
 * US-12: merge lines that share the same assignee and workflow into one task.
 */
export function groupTaskDraftsByAssigneeAndWorkflow(
  drafts: TaskDraft[],
): TaskDraft[] {
  const buckets = new Map<string, TaskDraft[]>();
  const order: string[] = [];

  for (const draft of drafts) {
    const key = groupKey(draft);
    if (!buckets.has(key)) {
      buckets.set(key, []);
      order.push(key);
    }
    buckets.get(key)!.push(draft);
  }

  return order.map((key) => {
    const group = buckets.get(key)!;
    const notes = appendMeetingSummaryLine(mergeNotes(group));

    if (group.length === 1) {
      return { ...group[0], notes };
    }

    const primary = group[0];
    return {
      ...primary,
      id: crypto.randomUUID(),
      taskName: mergeTaskName(group),
      notes,
      budgetedHours: "01:00",
      daysToComplete: "1",
    };
  });
}
