# User stories

Bulk create ad hoc tasks from meeting notes.

---

## Bulk create ad hoc tasks from meeting notes

**US-1**  
As a **firm staff member**, I want to **paste a meeting summary and generate ad hoc tasks from action items**, so that **I don’t create each task manually**.

**Acceptance**
- Meeting modal tabs: **Agenda**, **Guests and Notes**, **Time Tracking**. **Tasks** appears after **Generate tasks from notes** or after tasks are created (e.g. `Tasks (1)`).
- **Guests and Notes**: empty state — *Turn meeting notes into ad hoc tasks automatically*; CTA **Paste summary or take notes**; paste or type full summary; **Save** notes.
- **Generate tasks from notes** is always visible when notes have content; creates **ad hoc firm tasks** for review on the **Tasks** tab.
- **Send via Client Loop** appears beside **Generate tasks from notes** when notes include action items for non-firm assignees (see **US-6**, **US-7**).
- Reopening a meeting with created tasks → **Tasks** tab, grouped created view (see **US-3**).

### What happens when you click Generate tasks from notes

1. **Parse** the saved notes for an **Action items** (or **Next Steps**) section.
   - **Zoom format** — assignee name on its own line, bullets underneath.
   - **Granola format** — one bullet per line with `(Name)` at the end.
2. **Resolve assignee** for each action item (see **Assignee matching** below).
   - Match → **firm action item** → eligible for ad hoc tasks.
   - No match → **client action item** → excluded from firm tasks (US-6); use **Send via Client Loop**.
3. **Suggest** workflow and task name per firm action item (keyword heuristics in demo).
4. **Group** firm action items into task drafts: **one ad hoc task per (assignee + workflow)** (see **Grouping rules**).
5. **Open Tasks tab** for review. User edits drafts, then **Create N tasks**.
   - No firm action items found → error with guidance.
   - Notes contain only client action items → no firm tasks; use **Send via Client Loop**.

### Assignee matching

Meeting summaries often use **first names only** (e.g. `Maria`). Match in this order:

1. **Guest list first** — fuzzy-match the name from the notes against meeting **Guests**. If the guest is a **Levvy user**, assign to that user.
2. **Levvy users** — if no guest match, fuzzy-match against the firm’s Levvy user directory (same first-name / nickname rules).
3. **No match** — treat as a **client action item** (e.g. Daniel, Priya with `[External]` on the guest list). Never create a firm task.

**Guest list signals**
- Levvy guest → name only (e.g. `Maria`).
- Client contact → `[External]` suffix (e.g. `Daniel [External]`).

User can fix assignee, client, workflow, and grouping in task review before create.

### Grouping rules

Firm tasks only — client action items are **never** grouped into firm tasks.

**One ad hoc task per (assignee + workflow):**

| Situation | Result |
| --------- | ------ |
| Same assignee + same workflow | **One task** — bullets combined in Notes |
| Same assignee + different workflow | **Separate tasks** — one per workflow |
| Same assignee + no workflow suggested | **One task** — workflow **Not linked** |

**Example** (Maria, Monthly Check-in — firm tasks only):

| Workflow | Task name | Notes |
| -------- | --------- | ----- |
| Monthly close | Complete month-close reconciliations | 2 reconcile/close bullets + View meeting summary |

Daniel and Priya’s items do not appear here — they are client action items (US-6, US-7).

Wrong grouping? Merge, split, or reassign in task review (US-2).

### Prefills (each firm task draft)

| Field | Source |
| ----- | ------ |
| **Client** | Meeting client; editable per task in review |
| **Assignee** | Resolved via guest list → Levvy users (see above) |
| **Workflow** | Suggested from action-item text; editable, clearable, or **Not linked** |
| **Task name** | Suggested from action-item text; fallback *Action items from {Meeting name}* |
| **Notes** | Bullets from grouped action items; last line **View meeting summary** (US-4) |
| **Budgeted hours** | `01:00` |
| **Days to complete** | `1` |
| **Start date** | Today |

### Tasks review

- Split layout: meeting notes pinned left; task cards right.
- Subtle helper: *Only action items matched with a Levvy user will be extracted here as firm tasks.*

### Auto-suggestions

- **Workflow** — suggest from client’s activated workflows (demo: keyword heuristics). Accept, change, clear, or leave not linked — all in task review.
- **Task name** — suggest from action-item text (demo: heuristics; production may use AI). Fallback: **Action items from {Meeting name}**. Override in task review.

---

## Edit suggested tasks

**US-2**  
As a **firm staff member**, I want to **review and edit suggested tasks before creating them**, so that **I can fix parsing and grouping mistakes**.

**Acceptance**
- Split layout: meeting notes pinned left; task cards right.
- Each card: **Notes** (large, auto-growing), then task name, client, assignee, workflow, hours, dates.
- Only **Levvy-matched** action items appear as cards; client action items are omitted (see **US-6**).
- **View meeting summary** in notes — hyperlink when not editing; opens **Guests and Notes**; deletable line (see **Meeting summary**).
- **Merge** — select 2+, pick task to **keep**, **Merge notes into kept task** (kept metadata unchanged; one summary line at bottom).
- **Duplicate**, **Delete**, **Add another task** (blank card, meeting client + defaults).

---

## Review created tasks

**US-3**  
As a **firm staff member on recurring meetings**, I want **created tasks grouped by client and status**, so that **I can see what came out of past meetings**.

**Acceptance**
- Workspace-style cards: status, due, hours, assignee, workflow.
- Grouped by client → status (like [team progress report](https://help.levvy.com/en/articles/9466204-how-to-view-team-progress-report)).
- Click card → **Task detail** modal (read-only Levvy-style card).
- **View meeting summary** in task notes — orange hyperlink only (plain-text duplicate line hidden in read-only view).
- Close task detail (**X** or backdrop) → meeting modal stays open on **Tasks** tab.
- **View meeting summary** link in task detail → **Guests and Notes** tab.

---

## Meeting summary

**US-4**  
As a **firm staff member**, I want the **meeting summary saved on the meeting** and **linked from each task**, so that **the meeting stays the source of truth**.

**Acceptance**
- Full summary on **Guests and Notes**; editable anytime.
- Each generated firm task’s notes end with **View meeting summary** (plain text, next line after bullets). Remove line to omit link for confidential meetings.
- In task review: line is editable plain text; when blurred, renders as hyperlink.
- In task detail (post-create): bullets only in notes body; **View meeting summary** shown once as hyperlink below.

**US-5** *(phase 2)* — Auto-import summary from AI notetaker (no paste).

---

## Client action items

**US-6**  
As a **firm staff member**, when assignee **isn’t a Levvy user**, I want **client action items** separate from firm tasks, so that **I don’t create internal tasks for outsiders**.

**Acceptance**
- No firm assignee match → **client action item**; **not** included in firm task review or **Create N tasks**.
- Assignee resolved via **guest list → Levvy users** (US-1); Levvy guest (e.g. Maria) → firm task; `[External]` guest (e.g. Daniel, Priya) → client action item.
- Client action items available for **Send via Client Loop** (US-7); not editable as firm task cards in v1.
- Ambiguous name (Levvy user + client contact) → flag; choose firm vs client *(phase 2)*.
- Move items between firm and client in review *(phase 2)*.

**Demo fixture** (ABC Bookstore Monthly Check-in):
- **Maria** — Levvy guest → 2 action items → 1 grouped firm task (Monthly close).
- **Daniel**, **Priya** — `[External]` guests → 4 client action items → **Send via Client Loop** only.

---

## Send meeting notes via Client Loop

**US-7**  
As a **firm staff member**, I want to **send saved meeting notes to the client via Client Loop**, so that **the client gets the recap and their action items in one place**.

**Acceptance**
- Entry: **Send via Client Loop** on **Guests and Notes** (beside **Generate tasks from notes**), visible when notes contain client action items.
- Opens **Message Client** modal (no separate meeting tab).
- **Select which client loop to send the notes to** * — dropdown; default = meeting client.
- **Subject** * — prefilled `Recap from {Meeting name}`; editable.
- **Assign a Tag** — optional; demo options: None, AP intake automation-v10, Fractional CFO Consulting, Onboarding.
- **Message** * — prefilled with **saved meeting notes** (full Guests and Notes content); editable.
- **Reply needed** — toggle, default **on**.
- **Send** — primary CTA; **Cancel** / **X** dismiss modal.
- Success confirmation in modal; user returns to meeting modal on current tab.

*(Phase 2: email channel, guest-level portal routing, attach client action items list separately, multi-client guest hints.)*

---

## Edit meeting

**US-8** — Edit meeting client, title, and schedule before generate or share.


---

## Phase 2

- Remember notetaker format and merge/split preferences over time.
- Auto-import from notetaker (US-5).
- Ambiguous assignee resolution (firm vs client).
- Move action items between firm tasks and client list in review.
- Email + portal distribution options; per-guest channel selection.

---

## Format fixtures

Demo: `/meeting` — **Open with client action items** launches ABC Bookstore fixture.

**Zoom** — assignee header, then bullets under each name.

**Granola** — one line per item, `(Name)` suffix.

**Mixed (Monthly Check-in sample)** — full text in [Sample meeting notes](#sample-meeting-notes) below.

→ Maria → 1 firm task · Daniel + Priya → 4 client action items → **Send via Client Loop**.

---

## Sample meeting notes

Paste these into **Guests and Notes** on `/meeting` (**Open with client action items** preloads the mixed fixture).

### Maria only (firm tasks)

Meeting: **Monthly Check-in** · Client: **ABC Bookstore**  
Launch: **Open Monthly Check-in (sample notes)**

```
Monthly Check-in — ABC Bookstore
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
```

**Expected:** 3 firm tasks for Maria (grouped by workflow: Monthly close, Tax preparation, Not linked).

### Mixed — firm + client action items

Meeting: **Monthly Check-in** · Client: **ABC Bookstore**  
Guests: Daniel `[External]`, Priya `[External]`, Maria (Levvy)  
Launch: **Open with client action items**

```
Monthly Check-in — ABC Bookstore
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
```

**Expected:**
- **1 firm task** for Maria (Monthly close — 2 bullets grouped)
- **4 client action items** for Daniel and Priya — not in task review; **Send via Client Loop** available
- **Message Client** message prefilled with full notes above; subject `Recap from Monthly Check-in`

