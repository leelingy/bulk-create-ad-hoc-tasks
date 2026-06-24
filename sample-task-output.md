# Sample task output — Meeting Modal V2

Reference for the **Tasks** tab in `MeetingModalV2` (`/meeting`) after **Generate tasks from notes**.  
Meeting: **Monthly Check-in** · Client: **ABC Bookstore**

---

## Scenario 1 — Levvy user names only

**Playground button:** *Meeting with action items contain only Levvy user names.*

### Meeting notes (reference panel)

```text
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

### Review tasks (3 firm tasks)

Five action lines are parsed; three **Monthly close** lines are grouped into one task (same assignee + workflow). Result: **3 tasks** for **Maria**.

#### Task 1

| Field | Value |
| --- | --- |
| **Task name** | Complete month-close reconciliations |
| **Client** | ABC Bookstore |
| **Assignee** | Maria |
| **Workflow** | Monthly close |
| **Budgeted hours** | 01:00 |
| **Days to complete** | 1 |
| **Notes** | • Reconcile Stripe payouts against Shopify deposits for March<br>• Categorize 12 uncoded Ramp transactions from last week<br>• Update the month-close checklist after we changed revenue recognition steps<br>View meeting summary |

#### Task 2

| Field | Value |
| --- | --- |
| **Task name** | Follow up with client on missing W-9 for |
| **Client** | ABC Bookstore |
| **Assignee** | Maria |
| **Workflow** | Tax preparation |
| **Budgeted hours** | 01:00 |
| **Days to complete** | 1 |
| **Notes** | • Follow up with client on missing W-9 for new contractor<br>View meeting summary |

#### Task 3

| Field | Value |
| --- | --- |
| **Task name** | Send Monthly Check-in summary and action items to |
| **Client** | ABC Bookstore |
| **Assignee** | Maria |
| **Workflow** | *(not linked — Ad hoc Task)* |
| **Budgeted hours** | 01:00 |
| **Days to complete** | 1 |
| **Notes** | • Send Monthly Check-in summary and action items to ABC Bookstore<br>View meeting summary |

### After **Create 3 tasks**

Created tasks appear grouped by client, then status (**Not Started**):

**ABC Bookstore**

- **Not Started** · Due 06/25 · 01:00 — **Complete month-close reconciliations** · Monthly close · Maria
- **Not Started** · Due 06/25 · 01:00 — **Follow up with client on missing W-9 for** · Tax preparation · Maria
- **Not Started** · Due 06/25 · 01:00 — **Send Monthly Check-in summary and action items to** · Ad hoc Task · Maria

---

## Scenario 2 — Levvy + non-Levvy user names

**Playground button:** *Meeting with action items contain both Levvy user and non-Levvy user name*

### Meeting notes (reference panel)

```text
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

### Review tasks (1 firm task)

Only **Maria** matches a Levvy user. **Daniel** and **Priya** are client contacts — their items are **not** firm tasks (available via **Send via Client Loop** instead).

#### Task 1

| Field | Value |
| --- | --- |
| **Task name** | Complete month-close reconciliations |
| **Client** | ABC Bookstore |
| **Assignee** | Maria |
| **Workflow** | Monthly close |
| **Budgeted hours** | 01:00 |
| **Days to complete** | 1 |
| **Notes** | • Reconcile Stripe payouts against Shopify deposits for March<br>• Categorize 12 uncoded Ramp transactions from last week<br>View meeting summary |

### Client action items (skipped — 4 items)

| Assignee | Summary |
| --- | --- |
| Daniel | Send signed W-9 for the new contractor |
| Daniel | Approve the revised March P&L by Friday |
| Priya | Upload the latest bank statements to the shared drive |
| Priya | Confirm the updated vendor list for recurring bills |

### After **Create 1 task**

**ABC Bookstore**

- **Not Started** · Due 06/25 · 01:00 — **Complete month-close reconciliations** · Monthly close · Maria

---

## Scenario 3 — Empty state

**Playground button:** *Empty state with no meeting notes*

No notes → **Generate tasks from notes** shows: *Add notes first, then generate tasks.*
