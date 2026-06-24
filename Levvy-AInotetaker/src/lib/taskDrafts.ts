import type { Client, ParsedActionItem, TaskDraft, Workflow } from "../types";
import { applySuggestionsToDraft } from "./applySuggestions";
import {
  matchAssigneeFromLine,
  matchContactFromName,
  matchUserFromCell,
} from "./matchAssignee";
import { parseActionItems } from "./parseActionItems";
import { summarizeActionItem } from "./summarizeActionItem";
import { TENANT_USERS } from "./mockData";

export function newTaskDraft(client: Client, partial?: Partial<TaskDraft>): TaskDraft {
  const today = new Date().toISOString().split("T")[0];
  return {
    id: crypto.randomUUID(),
    taskName: "",
    notes: "",
    clientId: client.id,
    clientName: client.name,
    audience: "firm",
    assigneeAmbiguous: false,
    assigneeId: null,
    assigneeName: null,
    workflowId: null,
    workflowName: null,
    budgetedHours: "01:00",
    billType: "billable",
    isHighPriority: false,
    startDate: today,
    daysToComplete: "",
    instructions: "",
    requireApproval: false,
    sourceItemIds: [],
    clientOverridden: false,
    suggestedTaskName: null,
    genericTaskName: null,
    suggestedWorkflowId: null,
    suggestedWorkflowName: null,
    taskNameSuggestionDismissed: false,
    workflowSuggestionDismissed: false,
    taskNameOverridden: false,
    workflowOverridden: false,
    ...partial,
  };
}

export function parsedItemsToDrafts(
  items: ParsedActionItem[],
  client: Client,
  workflows: Workflow[],
  meetingTitle?: string,
): TaskDraft[] {
  return items.map((item) => {
    let assigneeId: string | null = null;
    let assigneeName: string | null = null;
    let audience: TaskDraft["audience"] = "firm";
    let assigneeAmbiguous = false;
    const notesText = item.text;

    if (item.assigneeName) {
      const matchedUser = matchUserFromCell(item.assigneeName, TENANT_USERS);
      if (matchedUser) {
        // Matched a Levvy user → internal firm task.
        assigneeId = matchedUser.id;
        assigneeName = matchedUser.name;
        // If the same name is also a contact on the meeting client, the
        // assignee is ambiguous (could be the client) — flag for confirmation.
        assigneeAmbiguous = !!matchContactFromName(
          item.assigneeName,
          client.contacts,
        );
      } else {
        // No Levvy user → assume it's an action item for the client.
        audience = "client";
        assigneeName = item.assigneeName;
      }
    } else {
      const fromLine = matchAssigneeFromLine(item.text, TENANT_USERS);
      if (fromLine) {
        assigneeId = fromLine.id;
        assigneeName = fromLine.name;
      }
    }

    const base = newTaskDraft(client, {
      id: item.id,
      taskName: summarizeActionItem(notesText),
      notes: notesText,
      audience,
      assigneeAmbiguous,
      assigneeId,
      assigneeName,
      sourceItemIds: [item.id],
    });

    return applySuggestionsToDraft(base, client, workflows, meetingTitle);
  });
}

export function extractActionItemsAsDrafts(
  summaryHtml: string,
  client: Client,
  workflows: Workflow[],
  meetingTitle?: string,
): TaskDraft[] {
  const knownNames = TENANT_USERS.map((u) => u.name);
  const raw = parseActionItems(summaryHtml, knownNames);
  const parsed: ParsedActionItem[] = raw.map((r) => ({
    id: crypto.randomUUID(),
    text: r.text,
    assigneeName: r.assigneeName,
  }));
  return parsedItemsToDrafts(parsed, client, workflows, meetingTitle);
}

export function mergeTaskDrafts(
  rows: TaskDraft[],
  selectedIds: Set<string>,
  primaryId: string,
  client: Client,
  workflows: Workflow[],
  meetingTitle?: string,
): TaskDraft[] {
  if (selectedIds.size < 2) return rows;
  const selected = rows.filter((r) => selectedIds.has(r.id));
  const primary = rows.find((r) => r.id === primaryId);
  if (!primary) return rows;

  const orderedNotes = selected
    .map((r) => r.notes.trim())
    .filter(Boolean)
    .map((n) => `• ${n}`)
    .join("\n");

  const mergedBase: TaskDraft = {
    ...primary,
    notes: orderedNotes,
    sourceItemIds: selected.flatMap((r) => r.sourceItemIds),
    taskName: primary.taskName || summarizeActionItem(orderedNotes),
    taskNameOverridden: false,
    workflowOverridden: false,
    taskNameSuggestionDismissed: false,
    workflowSuggestionDismissed: false,
  };

  const merged = applySuggestionsToDraft(
    mergedBase,
    client,
    workflows,
    meetingTitle,
  );

  const removeIds = new Set(
    [...selectedIds].filter((id) => id !== primaryId),
  );
  const idx = rows.findIndex((r) => r.id === primaryId);
  const next = rows.filter((r) => !removeIds.has(r.id));
  return next.map((r, i) => (i === idx ? merged : r));
}
