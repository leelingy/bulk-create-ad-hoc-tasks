import type { TaskDraft } from "@/lib/types";
import { matchUserFromCell } from "@/lib/matchAssignee";
import { TENANT_USERS } from "@/lib/tenantUsers";
import { newDefaultBulkTaskRow } from "@/lib/bulkTaskDefaults";
import { groupTaskDraftsByAssigneeAndWorkflow } from "@/lib/groupTaskDrafts";
import { isClientAssignee, isFirmAssignee } from "@/lib/actionItemAssignee";
import { summarizeActionItem } from "@/lib/summarizeActionItem";
import { suggestWorkflowFromNotes } from "@/lib/suggestWorkflow";

const LIST_PREFIX = /^\s*(?:[-*•]|\d+[\.)])\s*(.+)$/;
const GRANOLA_SUFFIX = /^(.+?)\s*\(([^)]+)\)\s*$/;

export type ParsedItem = {
  notes: string;
  assigneeName?: string;
};

function isActionItemsHeading(line: string): boolean {
  const t = line.trim().replace(/^#{1,6}\s*/, "").replace(/\*+/g, "").trim();
  if (!t || t.length > 40) return false;
  return /^action items?:?\s*$/i.test(t);
}

function isMarkdownHeadingStart(line: string): boolean {
  return line.trim().startsWith("#");
}

function stripListPrefix(raw: string): string {
  const m = raw.match(LIST_PREFIX);
  if (m?.[1]) return m[1].trim();
  return raw.trim();
}

function findActionSectionLines(text: string): string[] {
  const lines = text.split(/\r?\n/);
  const headingIdx = lines.findIndex(isActionItemsHeading);
  if (headingIdx === -1) return lines;
  const section: string[] = [];
  for (let i = headingIdx + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (isMarkdownHeadingStart(line)) break;
    section.push(line);
  }
  return section;
}

function isLikelyZoomAssigneeHeader(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed || LIST_PREFIX.test(line)) return false;
  if (trimmed.length > 50) return false;
  if (/^(summary|action items?)$/i.test(trimmed)) return false;
  const words = trimmed.split(/\s+/);
  if (words.length > 4) return false;
  if (trimmed.includes(".") && words.length > 3) return false;
  return true;
}

function resolveAssignee(name: string | undefined): {
  assigneeId: string | null;
  assigneeName: string | null;
} {
  if (!name?.trim()) return { assigneeId: null, assigneeName: null };
  const matched = matchUserFromCell(name.trim(), TENANT_USERS);
  if (matched) return { assigneeId: matched.id, assigneeName: matched.name };
  return { assigneeId: null, assigneeName: name.trim() };
}

function parseZoomSection(sectionLines: string[]): ParsedItem[] {
  const items: ParsedItem[] = [];
  let currentAssignee: string | undefined;

  for (const line of sectionLines) {
    const trimmed = line.trim();
    if (!trimmed || isActionItemsHeading(trimmed)) continue;

    if (LIST_PREFIX.test(line)) {
      const body = stripListPrefix(line);
      if (body) items.push({ notes: body, assigneeName: currentAssignee });
      continue;
    }

    if (isLikelyZoomAssigneeHeader(line)) {
      const matched = matchUserFromCell(trimmed, TENANT_USERS);
      currentAssignee = matched?.name ?? trimmed;
    }
  }

  return items;
}

function parseGranolaSection(sectionLines: string[]): ParsedItem[] {
  const items: ParsedItem[] = [];
  for (const line of sectionLines) {
    const trimmed = line.trim();
    if (!trimmed || isActionItemsHeading(trimmed)) continue;
    const body = stripListPrefix(line);
    const m = body.match(GRANOLA_SUFFIX);
    if (m) {
      items.push({ notes: m[1].trim(), assigneeName: m[2].trim() });
    } else if (body) {
      items.push({ notes: body });
    }
  }
  return items;
}

export function extractParsedItems(notes: string): ParsedItem[] {
  const section = findActionSectionLines(notes);
  const nonEmpty = section.filter((l) => l.trim());
  if (nonEmpty.length === 0) return [];

  const zoom = parseZoomSection(section);
  if (zoom.length > 0) return zoom;

  const granola = parseGranolaSection(section);
  if (granola.length > 0) return granola;

  const bullets = nonEmpty
    .filter((l) => LIST_PREFIX.test(l))
    .map((l) => ({ notes: stripListPrefix(l) }))
    .filter((p) => p.notes.length > 0);
  if (bullets.length > 0) return bullets;

  return nonEmpty
    .filter((l) => !isLikelyZoomAssigneeHeader(l))
    .map((l) => ({ notes: stripListPrefix(l) }))
    .filter((p) => p.notes.length > 0);
}

function itemToDraft(item: ParsedItem, clientName: string): TaskDraft {
  const { assigneeId, assigneeName } = resolveAssignee(item.assigneeName);
  const workflow = suggestWorkflowFromNotes(item.notes);
  const taskName = summarizeActionItem(item.notes);

  return {
    ...newDefaultBulkTaskRow(),
    id: crypto.randomUUID(),
    taskName,
    clientName,
    assigneeId,
    assigneeName,
    notes: item.notes,
    workflow,
    budgetedHours: "01:00",
    daysToComplete: "1",
  };
}

/**
 * Parse meeting notes into grouped task drafts (US-9 / US-12):
 * one task per (assignee + workflow), with suggested task names and workflows.
 */
export function generateTasksFromNotes(
  notes: string,
  clientName: string,
): {
  drafts: TaskDraft[];
  error: string | null;
  /** Action items skipped because assignee is not a Levvy user. */
  clientItemsSkipped: number;
} {
  const items = extractParsedItems(notes);
  if (items.length === 0) {
    return {
      drafts: [],
      error:
        'No action items found. Add bullet lines under an "Action items" heading, or paste one item per line.',
      clientItemsSkipped: 0,
    };
  }

  const perLine = items
    .filter((item) => isFirmAssignee(item.assigneeName))
    .map((item) => itemToDraft(item, clientName));
  const clientItemsSkipped = items.filter((item) =>
    isClientAssignee(item.assigneeName),
  ).length;

  if (perLine.length === 0) {
    return {
      drafts: [],
      error:
        clientItemsSkipped > 0
          ? "No firm tasks to create. Client action items can be sent via Client Loop."
          : 'No action items found. Add bullet lines under an "Action items" heading, or paste one item per line.',
      clientItemsSkipped,
    };
  }

  const drafts = groupTaskDraftsByAssigneeAndWorkflow(perLine);

  return { drafts, error: null, clientItemsSkipped };
}
