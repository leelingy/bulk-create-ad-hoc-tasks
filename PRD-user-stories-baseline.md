# User stories

Bulk create ad hoc tasks from meeting notes.

> **Archived baseline** — original user-stories doc before Client Loop, assignee-matching, and generate-flow refinements. See [PRD-user-stories.md](./PRD-user-stories.md) for the current spec.

---

## Bulk create ad hoc tasks from meeting notes

**US-1**  
As a **firm staff member**, I want to **paste a meeting summary and generate ad hoc tasks from action items**, so that **I don’t create each task manually**.

**Acceptance**
- Meeting modal tabs: **Agenda**, **Guests and Notes**, **Time Tracking**. **Tasks** appears after generate or create (e.g. `Tasks (3)`).
- **Guests and Notes**: empty state with **Take notes**; paste or type full summary; **Save** notes.
- **Generate tasks from notes** is always visible; disabled until notes are saved.
- Generate parses action items, applies grouping below, opens **Tasks** for review. No items found → **No action items detected** with **Add task** still available.
- Reopening a meeting with created tasks → **Tasks** tab, grouped view (see **Review created tasks**).

**Prefills**
- **Client** — meeting client on each task; editable in **Edit suggested tasks** (e.g. internal meetings with multiple clients).
- **Assignee** — from notes: Zoom assignee headers, Granola `(Name)` suffixes. Match **Levvy users**; **Action items** or **Next Steps** heading. Same first name → first match; fix in **Edit suggested tasks**. Unmatched → **Client action items**.
- **Notes** — bullet list per task; last line **View meeting summary** (see **Meeting summary**).
- **Defaults** — budgeted hours `01:00`, days to complete `1`, start date today.

### Auto-suggestions

- **Workflow** — suggest from client’s activated workflows (demo: keyword heuristics). Accept, change, clear, or leave not linked — all in **Edit suggested tasks**.
- **Task name** — suggest from action-item text (demo: heuristics; production may use AI). Fallback: **Action items from {Meeting name}**. Override in **Edit suggested tasks**.

### Group by assignee + workflow

One task per **(assignee + workflow)**:
- Same assignee + same workflow → one task (bullets in notes).
- Same assignee + different workflow → separate tasks.
- Same assignee + no workflow → one **Not linked** task.

**Example** (Maria, Monthly Check-in):

| Workflow | Task name | Notes |
| -------- | --------- | ----- |
| Monthly close | Complete month-close reconciliations | 3 reconcile/close bullets + View meeting summary |
| Tax preparation | Follow up on missing W-9 | W-9 bullet + View meeting summary |
| Not linked | Send summary to client | Send-summary bullet + View meeting summary |

Wrong grouping? Merge, split, or reassign in **Edit suggested tasks**.

---

## Edit suggested tasks

**US-2**  
As a **firm staff member**, I want to **review and edit suggested tasks before creating them**, so that **I can fix parsing and grouping mistakes**.

**Acceptance**
- Split layout: meeting notes pinned left; task cards right.
- Each card: **Notes** (large, auto-growing), then task name, client, assignee, workflow, hours, dates.
- **View meeting summary** in notes — hyperlink when not editing; opens **Guests and Notes**; deletable line (see **Meeting summary**).
- **Merge** — select 2+, pick task to **keep**, **Merge notes into kept task** (kept metadata unchanged; one summary line at bottom).
- **Duplicate**, **Delete**, **Add another task** (blank card, meeting client + defaults).

---

## Review created tasks

**US-3**  
As a **firm staff member on recurring meetings**, I want **created tasks grouped by client and status**, so that **I can see what came from past meetings**.

**Acceptance**
- Workspace-style cards: status, due, hours, assignee, workflow.
- Grouped by client → status (like [team progress report](https://help.levvy.com/en/articles/9466204-how-to-view-team-progress-report)).
- Click card → edit modal (same notes/link behavior as **Edit suggested tasks**).
- **Edit tasks** → back to review layout; **View created tasks** → grouped view.

---

## Meeting summary

**US-4**  
As a **firm staff member**, I want the **meeting summary saved on the meeting** and **linked from each task**, so that **the meeting stays the source of truth**.

**Acceptance**
- Full summary on **Guests and Notes**; editable anytime.
- Each generated task notes end with **View meeting summary** (plain text, next line after bullets). Remove line to omit link for confidential meetings.

**US-5** *(phase 2)* — Auto-import summary from AI notetaker (no paste).

---

## Client action items

**US-6**  
As a **firm staff member**, when assignee **isn’t a Levvy user**, I want **client action items** separate from firm tasks, so that **I don’t create internal tasks for outsiders**.

**Acceptance**
- No Levvy match → **Action items for the client** section (not created as firm tasks).
- Ambiguous name (Levvy user + client contact) → flag; choose firm vs client.
- Edit wording before share; move items between firm and client in **Edit suggested tasks**.

---

## Share summary and action items with the client

**US-7**  
As a **firm staff member**, I want to **send the summary and client action items** by email or portal, so that **the client gets what they need in one place**.

**Acceptance**
- Choose email or portal (portal when guest is a client contact with portal access).
- Multi-client guests → show which other clients they’re on.
- Portal: mark **action required**; subject **Action items from {Meeting name}**.
- Toggle **Send action items to the client** (default on when client items exist).

---

## Edit meeting

**US-8** — Edit meeting client, title, and schedule before generate or share.

---

## Workflow notes from highlighted text

**US-9** — Highlight text in notes → **Modify workflow notes** modal (client prefilled, pick workflow, edit text, preview append with *modified based on discussion from {meeting} by {person}*).

---

## Phase 2

- Remember notetaker format and merge/split preferences over time.
- Auto-import from notetaker (US-5).

---

## Format fixtures

Demo: `/meeting`, `/`.

**Zoom** — assignee header, then bullets under each name.

**Granola** — one line per item, `(Name)` suffix.
