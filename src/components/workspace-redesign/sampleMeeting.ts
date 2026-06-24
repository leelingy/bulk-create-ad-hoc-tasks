import type { Meeting, TaskDraft } from "@/lib/types";
import { todayISODate } from "@/lib/bulkTaskDefaults";

/**
 * Sample meeting + draft tasks built from the PRD "Monthly Check-in" fixture
 * (US-9). Notes are intentionally long and bulleted so the redesigned, larger
 * Notes area is easy to evaluate.
 */

export const SAMPLE_MEETING_NOTES = `Monthly Check-in — ABC Bookstore
Mar 25, 2026 · 9:00–10:00am

Summary
Reviewed March month-close progress, outstanding client items, and the process
changes following the revenue-recognition update. Maria is driving the close;
a few items are blocked on the client.

Action items
Maria
- Reconcile Stripe payouts against Shopify deposits for March
- Categorize 12 uncoded Ramp transactions from last week
- Follow up with client on missing W-9 for new contractor
- Update the month-close checklist after we changed revenue recognition steps
- Send Monthly Check-in summary and action items to ABC Bookstore
`;

function draft(partial: Partial<TaskDraft>): TaskDraft {
  return {
    id: crypto.randomUUID(),
    taskName: "",
    clientName: "ABC Bookstore",
    assigneeId: null,
    assigneeName: null,
    notes: "",
    instructions: "",
    budgetedHours: "01:00",
    startDate: todayISODate(),
    daysToComplete: "3",
    workflow: "",
    billType: "Billable",
    ...partial,
  };
}

export function sampleDraftTasks(): TaskDraft[] {
  return [
    draft({
      taskName: "Complete March month-close reconciliations",
      assigneeId: "u-natalie",
      assigneeName: "Natalie Cook",
      workflow: "Monthly close",
      budgetedHours: "03:00",
      notes:
        "• Reconcile Stripe payouts against Shopify deposits for March\n" +
        "• Categorize 12 uncoded Ramp transactions from last week\n" +
        "• Update the month-close checklist after we changed revenue recognition steps",
    }),
    draft({
      taskName: "Follow up on missing W-9 for contractor",
      assigneeId: "u-natalie",
      assigneeName: "Natalie Cook",
      workflow: "",
      budgetedHours: "00:30",
      notes: "• Follow up with client on missing W-9 for new contractor",
    }),
    draft({
      taskName: "Send meeting notes to client",
      assigneeId: "u-lee",
      assigneeName: "Lee Ling",
      workflow: "",
      budgetedHours: "00:15",
      notes: "• Send Monthly Check-in summary and action items to ABC Bookstore",
    }),
  ];
}

export function sampleMeeting(): Meeting {
  return {
    id: "sample-monthly-checkin",
    title: "Monthly Check-in",
    clientName: "ABC Bookstore",
    dayIndex: 2,
    startLabel: "09:00 am",
    endLabel: "10:00 am",
    notes: SAMPLE_MEETING_NOTES,
    savedTasks: sampleDraftTasks(),
    accent: "orange",
  };
}

export const SAMPLE_BULK_DOC_PASTE = `Maria
- Reconcile Stripe payouts against Shopify deposits for March
- Categorize 12 uncoded Ramp transactions from last week
- Follow up with client on missing W-9 for new contractor
- Update the month-close checklist after we changed revenue recognition steps
`;
