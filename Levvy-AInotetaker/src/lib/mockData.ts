import type { Client, Guest, Meeting, TenantUser, Workflow } from "../types";

export const TENANT_USERS: TenantUser[] = [
  { id: "u-lee", name: "Lee Ling Yang", email: "lee@example.com" },
  { id: "u-awais", name: "Awais", email: "awais@example.com" },
  { id: "u-jeanne", name: "Jeanne", email: "jeanne@example.com" },
  { id: "u-kalina", name: "Kalina", email: "kalina@example.com" },
  { id: "u-colette", name: "Colette Collaborator", email: "colette@example.com" },
  { id: "u-sam", name: "Sam Manager", email: "sam@example.com" },
];

export const CLIENTS: Client[] = [
  {
    id: "c-abc",
    name: "ABC Bookstore",
    hasPortal: true,
    activatedWorkflowIds: ["w-1", "w-3", "w-4", "w-5"],
    contacts: [
      { id: "ct-1", name: "Jane Doe", email: "jane.doe@abcbookstore.com" },
      { id: "ct-2", name: "John Smith", email: "john@abcbookstore.com" },
      // Same first name as the Levvy user "Jeanne" → used to demo the
      // ambiguous-assignee flag in the review.
      { id: "ct-7", name: "Jeanne Park", email: "jeanne@abcbookstore.com" },
    ],
  },
  {
    id: "c-global",
    name: "Global Solutions",
    hasPortal: false,
    activatedWorkflowIds: ["w-3", "w-6"],
    contacts: [
      { id: "ct-3", name: "Jane Doe", email: "jane.doe@abcbookstore.com" },
      { id: "ct-4", name: "Maria Garcia", email: "maria@global.com" },
    ],
  },
  {
    id: "c-mfg",
    name: "Manufacturing Inc.",
    hasPortal: true,
    activatedWorkflowIds: ["w-1", "w-3"],
    contacts: [
      { id: "ct-5", name: "Bob Wilson", email: "bob@mfg.com" },
    ],
  },
];

export const WORKFLOWS: Workflow[] = [
  { id: "w-1", name: "_Payable" },
  { id: "w-2", name: "_Set Up Levvy" },
  { id: "w-3", name: "_Month Close" },
  { id: "w-4", name: "_Revenue Recognition" },
  { id: "w-5", name: "Client onboarding" },
  { id: "w-6", name: "Advisory" },
];

export const SAMPLE_GUESTS: Guest[] = [
  { name: "Jane Doe", email: "jane.doe@abcbookstore.com" },
  { name: "John Smith", email: "john@abcbookstore.com" },
  { name: "External Guest", email: "guest@external.com" },
];

export function createSampleMeeting(overrides?: Partial<Meeting>): Meeting {
  return {
    id: "kick-off-call-001",
    title: "Kick-off call",
    date: "Wednesday - 12/10/2025",
    time: "09:45 am - 10:45 am",
    client: CLIENTS[0],
    summaryHtml: "",
    guests: SAMPLE_GUESTS,
    ...overrides,
  };
}

export const ZOOM_SAMPLE_NOTES = `Action items

Jeanne
Share the updated flow and discussion with Li Ling for additional input.
Kalina
Create a complete end-to-end flow example of the vendor matching and QuickAdd process, incorporating the discussed feedback and QuickBooks terminology, and share it with Jeanne and Li Ling for further review.
Review and refine the user interface and language to better match the QuickBooks "QuickAdd" flow and terminology, ensuring the process is seamless and intuitive for users familiar with QuickBooks.

Granola format examples:
- Investigate e-signature white-label solutions and AICPA/SOC 2 verification requirements (Lee Ling Yang)
- Build PR for workflow billing rates feature (Lee Ling Yang)
- Fix red-flagged client portal items in prod, then remove feature flag for user testing (Awais/team)`;

export const SAMPLE_HTML_NOTES = `
<h3>Tools, Systems & Integrations</h3>
<p>Client uses Stripe, PayPal, Shopify, and ACH transfers for revenue collection.</p>
<p>They manage expenses using Ramp but have not fully activated the receipt-capture workflow.</p>

<h3>Action items</h3>
<ul>
<li>Investigate e-signature white-label solutions (Lee Ling Yang)</li>
<li>Build PR for workflow billing rates feature (Lee Ling Yang)</li>
<li>Fix red-flagged client portal items in prod (Awais/team)</li>
<li>Send over the missing Q2 bank statements (Jane Doe)</li>
<li>Approve the updated revenue recognition policy (Jeanne)</li>
</ul>
`.trim();
