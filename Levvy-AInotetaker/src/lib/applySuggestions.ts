import type { Client, TaskDraft, Workflow } from "../types";
import { suggestTaskNameFromNotes, genericMeetingTaskName } from "./suggestTaskName";
import { suggestWorkflowFromNotes } from "./suggestWorkflow";

export function applySuggestionsToDraft(
  draft: TaskDraft,
  client: Client,
  workflows: Workflow[],
  meetingTitle?: string,
): TaskDraft {
  const suggestedTaskName = suggestTaskNameFromNotes(draft.notes);
  const suggestedWorkflow = suggestWorkflowFromNotes(
    draft.notes,
    client,
    workflows,
  );
  const genericTaskName = meetingTitle
    ? genericMeetingTaskName(meetingTitle)
    : draft.genericTaskName ?? null;

  const next: TaskDraft = {
    ...draft,
    suggestedTaskName,
    suggestedWorkflowId: suggestedWorkflow?.id ?? null,
    suggestedWorkflowName: suggestedWorkflow?.name ?? null,
    genericTaskName,
  };

  if (!draft.taskNameOverridden && !draft.taskNameSuggestionDismissed) {
    next.taskName = suggestedTaskName;
  }

  if (!draft.workflowOverridden && !draft.workflowSuggestionDismissed) {
    next.workflowId = suggestedWorkflow?.id ?? null;
    next.workflowName = suggestedWorkflow?.name ?? null;
  }

  return next;
}

export function refreshDraftSuggestions(
  draft: TaskDraft,
  clients: Client[],
  workflows: Workflow[],
  meetingTitle?: string,
  patch?: Partial<TaskDraft>,
): TaskDraft {
  const merged = { ...draft, ...patch };
  const client =
    clients.find((c) => c.id === merged.clientId) ?? clients[0];
  return applySuggestionsToDraft(merged, client, workflows, meetingTitle);
}
