Problem to solve. 

- easily convert all action items from meeting to a single or different ad hoc tasks and assigned to the correct assignee
  - why different - it might be tied to a different workflow
  - why same - same workflow or not linked.
- Every meeting notetaker has differnet format.
. Zoom groups multiple items under an assignee header; Granola is one item per line with (Name) suffixes.
- users will use the same meeting notetaker from the same software, so assumpiton is that format is predictable per source, unless there are different templates for same software — use deterministic rules (not AI) for default task grouping; AI is optional later for workflow-intent splits
  - detect or import source: zoom | granola | unknown (phase 2: source from integration API, not guessed from text)
  - default grouping by source:
    - Zoom: auto-merge by assignee → one task per person; combine lines under that header as bullet notes in the task
    - Granola: one task per line (format already maps 1:1)
    - unknown / manual: one task per line; user merges in review
  - always show a review table before create, with the grouping explained (e.g. "Grouped by assignee (Zoom)") and controls to split or merge rows
  - user can override default: toggle "One task per assignee" vs "One task per line" in review
  - when editing suggested tasks in the review table, user can click **Add another task** to add a blank row and create a task from scratch (e.g. an action item not captured in the pasted notes)
  - why one task vs many for the same assignee is a separate question from line count:
    - same workflow or not linked → merge
    - different workflows → separate tasks
  - group by (assignee, workflow) when auto-merging
  - optional later (AI): suggest split/merge within an assignee block when items look like different workflows/topics — suggest only, user confirms in review; not required for v1
  - example (bookkeeping firm): Levvy Accounting, client ABC Bookstore, monthly check-in; Zoom block under assignee Maria:
    Maria
    Reconcile Stripe payouts against Shopify deposfits for March
    Categorize 12 uncoded Ramp transactions from last week
    Follow up with client on missing W-9 for new contractor
    Update the month-close checklist after we changed revenue recognition steps
    - merge (same workflow): first two lines both _Month Close → 1 task for Maria on _Month Close with both bullets in notes
    - separate (different workflows): if W-9 follow-up is _Payable and the other three lines are _Month Close → 2 tasks for Maria (month-close task with 3 bullets; payables task with W-9 line), not 1 task and not 4
    - merge (not linked): e.g. "Send portal link for Q2 bank statements" + "Remind client payroll cutoff is Friday" with no workflow → 1 task for Maria, workflow Not linked, both bullets in notes
    - compared to one task per line: 4 lines → 4 tasks; one task per assignee only: 4 lines → 1 task; one task per (assignee + workflow): 4 lines → 2 tasks when one line maps to a different workflow
- auto-suggest workflow and task name in the review table (each row / each task):
    - workflow: suggest which **activated** workflow on the client the task should relate to, based on task notes/description; show as a **suggested tag** on the workflow field
        - user can remove the suggestion, select a different workflow, or leave workflow blank (not linked)
        - only suggest from workflows that are activated for the client
    - task name: suggest a short task name based on task description/notes; show as a **suggested tag** on the task name field
        - user can remove the suggestion and type their own name
        - user can accept the suggestion as-is
        - user can pick a generic fallback: **Action items from {Meeting name}**
- when the user pastes the entire meeting summary into the meeting notes, save the summary on the meeting’s **Guests and Notes** tab (meeting is source of truth)
- each generated task’s notes include a final line, **View meeting summary**, on the line after the last action-item bullet; it is plain text in the notes field, saved on the task, and editable/removable
- when not editing notes, **View meeting summary** is a hyperlink that opens the meeting modal’s **Guests and Notes** tab; users delete that line to omit the link (no separate toggle)
- next phase: integrate with other meeting note takers (e.g. Zoom, Granola) to pull the meeting summary automatically so users don't have to paste it in manually
- if an action item's assignee name doesn't match an existing Levvy user, assume it's an action item for the client (don't create an internal task)
  - match assignee names against Levvy users only; no match → client action item
  - flag the row when a name matches both a Levvy user and a contact on the meeting's client (ambiguous) so the user can confirm
  - show client action items in a separate "Action items for the client" section in review; user can move items between firm task and client
- distribute the meeting notes to the client (cause there might be action items for the client)
  - show the user which invited guests match an existing client contact (by email), so they know who can receive it via portal
  - let the user choose how to distribute the summary: via email or via portal
  - portal is only selectable when the guest email matches a client contact AND that client has client portals set up; otherwise only email is available
  - distribute action items for the client and mark it action required. subject of the chat: Action items from {Meeting name}
  - include the client action items identified during task review in what's shared with the client

---

User stories and format fixtures: [PRD-user-stories.md](./PRD-user-stories.md) (US-1 through US-9).
