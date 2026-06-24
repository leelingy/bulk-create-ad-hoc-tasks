import { WORKFLOWS, type WorkflowName } from "./tenantUsers";

/** Keyword hints per workflow name (demo heuristic; firm-configurable later). */
const WORKFLOW_KEYWORDS: Record<WorkflowName, string[]> = {
  "Client onboarding": ["onboarding", "on-board", "kick-off", "kickoff", "setup client"],
  "Monthly close": [
    "month close",
    "month-close",
    "monthly close",
    "reconcile",
    "reconciliation",
    "ramp",
    "stripe",
    "shopify",
    "month-end",
    "checklist",
    "revenue recognition",
    "categorize",
    "uncoded",
  ],
  "Tax preparation": ["tax", "w-9", "w9", "1099", "irs"],
  Advisory: ["advisory", "consult", "strategy"],
  Bookkeeping: ["bookkeep", "general ledger", "journal entry"],
  Payroll: ["payroll", "pay stub"],
};

/**
 * Suggest an activated workflow from task notes text.
 * Returns empty string when not linked.
 */
export function suggestWorkflowFromNotes(notes: string): string {
  const text = notes.toLowerCase().trim();
  if (!text) return "";

  let best: { workflow: WorkflowName; score: number } | null = null;

  for (const workflow of WORKFLOWS) {
    let score = 0;
    const normalizedName = workflow.toLowerCase().replace(/_/g, " ");
    for (const part of normalizedName.split(/\s+/)) {
      if (part.length > 2 && text.includes(part)) score += 2;
    }
    for (const kw of WORKFLOW_KEYWORDS[workflow]) {
      if (text.includes(kw)) score += 3;
    }
    if (!best || score > best.score) {
      best = { workflow, score };
    }
  }

  return best && best.score >= 3 ? best.workflow : "";
}
