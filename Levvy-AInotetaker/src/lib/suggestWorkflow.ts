import type { Client, Workflow } from "../types";

/** Keywords that hint at a workflow (demo heuristic; replace with firm config later). */
const WORKFLOW_KEYWORDS: Record<string, string[]> = {
  "w-1": ["w-9", "payable", "payables", "vendor", "invoice", "bill", "contractor"],
  "w-3": [
    "month close",
    "month-close",
    "monthly close",
    "reconcile",
    "reconciliation",
    "ramp",
    "stripe",
    "shopify",
    "month-end",
  ],
  "w-4": ["revenue recognition", "rev rec", "deferred revenue"],
  "w-5": ["onboarding", "on-board", "kick-off", "kickoff", "setup client"],
  "w-6": ["advisory", "consult", "strategy"],
  "w-2": ["set up levvy", "levvy setup", "quickadd", "quick add"],
};

export function getActivatedWorkflows(
  client: Client,
  allWorkflows: Workflow[],
): Workflow[] {
  const ids = new Set(client.activatedWorkflowIds ?? []);
  return allWorkflows.filter((w) => ids.has(w.id));
}

export function suggestWorkflowFromNotes(
  notes: string,
  client: Client,
  allWorkflows: Workflow[],
): Workflow | null {
  const activated = getActivatedWorkflows(client, allWorkflows);
  if (activated.length === 0 || !notes.trim()) return null;

  const text = notes.toLowerCase();
  let best: { workflow: Workflow; score: number } | null = null;

  for (const workflow of activated) {
    let score = 0;
    const normalizedName = workflow.name.toLowerCase().replace(/_/g, " ");
    for (const part of normalizedName.split(/\s+/)) {
      if (part.length > 2 && text.includes(part)) score += 2;
    }
    const keywords = WORKFLOW_KEYWORDS[workflow.id] ?? [];
    for (const kw of keywords) {
      if (text.includes(kw)) score += 3;
    }
    if (!best || score > best.score) {
      best = { workflow, score };
    }
  }

  return best && best.score >= 3 ? best.workflow : null;
}
