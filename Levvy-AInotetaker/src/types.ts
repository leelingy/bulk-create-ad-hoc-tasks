export interface Contact {
  id: string;
  name: string;
  email: string;
}

export interface Client {
  id: string;
  name: string;
  contacts: Contact[];
  hasPortal: boolean;
  /** Workflows activated for this client (subset of firm workflows). */
  activatedWorkflowIds: string[];
}

export interface Workflow {
  id: string;
  name: string;
}

export interface TenantUser {
  id: string;
  name: string;
  email: string;
}

export interface Guest {
  name: string;
  email: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  client: Client;
  summaryHtml: string;
  guests: Guest[];
}

export interface ParsedActionItem {
  id: string;
  text: string;
  assigneeName?: string;
}

/**
 * "firm" = internal ad hoc task assigned to a Levvy user.
 * "client" = action item for the client (assignee name didn't match a Levvy
 * user); shared with the client rather than created as an internal task.
 */
export type TaskAudience = "firm" | "client";

export interface TaskDraft {
  id: string;
  taskName: string;
  notes: string;
  clientId: string;
  clientName: string;
  audience: TaskAudience;
  /** True when the assignee name matched both a Levvy user and a client contact. */
  assigneeAmbiguous?: boolean;
  assigneeId: string | null;
  assigneeName: string | null;
  workflowId: string | null;
  workflowName: string | null;
  budgetedHours: string;
  billType: "billable" | "non-billable";
  isHighPriority: boolean;
  startDate: string;
  daysToComplete: string;
  instructions: string;
  requireApproval: boolean;
  sourceItemIds: string[];
  /** True when user manually changed client on this row */
  clientOverridden?: boolean;
  /** Auto-suggested task name from notes (shown as tag until dismissed or overridden) */
  suggestedTaskName?: string | null;
  /** Generic fallback: Action items from {meeting name} */
  genericTaskName?: string | null;
  suggestedWorkflowId?: string | null;
  suggestedWorkflowName?: string | null;
  taskNameSuggestionDismissed?: boolean;
  workflowSuggestionDismissed?: boolean;
  taskNameOverridden?: boolean;
  workflowOverridden?: boolean;
}

export interface CreatedTask extends TaskDraft {
  meetingId: string;
  createdAt: string;
}

export interface TextSelection {
  text: string;
  startOffset: number;
  endOffset: number;
  boundingRect: DOMRect | null;
}

export type DistributionChannel = "portal" | "email";

export interface GuestDistributionRow {
  guest: Guest;
  channel: DistributionChannel;
  portalEligible: boolean;
  emailOnly: boolean;
  matchedOnMeetingClient: boolean;
  otherMatchingClients: string[];
}
