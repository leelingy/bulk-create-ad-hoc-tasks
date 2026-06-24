import type { MeetingV2 } from "./types";

export const SAMPLE_MEETING_V2: MeetingV2 = {
  id: "all-team-meeting",
  title: "All Team meeting",
  scheduleLabel: "Monday - 06/22/2026 11:00 pm - 12:00 am",
  recurrenceLabel: "Monday of every week",
  clientName: "Integrated Technology Consultants Inc.",
  guests: [
    { name: "April Jones", title: "OffShore", initials: "AJ" },
    { name: "Beatrice Sullivan", title: "CFO", initials: "BS" },
    { name: "Jessica Smith", initials: "JS" },
    { name: "Lee Ling", title: "Product", initials: "LL" },
    { name: "Sam Manager", title: "Operations", initials: "SM" },
  ],
  agendaHtml: "",
  comments: [],
  notes: "",
  savedTasks: [],
};

/** Monthly Check-in fixture — matches Variant B screenshot / PRD. */
export const SAMPLE_MONTHLY_CHECKIN: MeetingV2 = {
  id: "monthly-checkin-abc",
  title: "Monthly Check-in",
  scheduleLabel: "Mar 25, 2026 · 9:00–10:00am",
  recurrenceLabel: "Monthly client check-in",
  clientName: "ABC Bookstore",
  guests: [
    { name: "Daniel", title: "Owner", initials: "D" },
    { name: "Priya", title: "Operations", initials: "PR" },
    { name: "Maria", title: "Bookkeeper", initials: "MA" },
  ],
  agendaHtml: "",
  comments: [],
  notes: "",
  savedTasks: [],
};

export const SAMPLE_NOTES_WITH_ACTION_ITEMS = `Monthly Check-in — ABC Bookstore
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

/**
 * Notes with a mix of internal (Maria) and client-side assignees. The client
 * contacts (Daniel, Priya) don't match any Levvy user — their items are
 * client action items only (Send via Client Loop), not firm tasks.
 */
export const SAMPLE_NOTES_WITH_CLIENT_ITEMS = `Monthly Check-in — ABC Bookstore
Mar 25, 2026 · 9:00–10:00am

Summary
Reviewed March close status and the open items waiting on the client. The team
is ready to finalize once the client sends remaining documents and approvals.

Action items
Maria
- Reconcile Stripe payouts against Shopify deposits for March
- Categorize 12 uncoded Ramp transactions from last week

Daniel
- Send signed W-9 for the new contractor
- Approve the revised March P&L by Friday

Priya
- Upload the latest bank statements to the shared drive
- Confirm the updated vendor list for recurring bills
`;
