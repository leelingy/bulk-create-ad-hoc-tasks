import {
  extractParsedItems,
  type ParsedItem,
} from "@/components/meeting-modal-v2/generateTasksFromNotes";
import { isClientAssignee } from "@/lib/actionItemAssignee";
import { summarizeActionItem } from "@/lib/summarizeActionItem";

export type ClientActionItem = {
  id: string;
  /** The typed assignee name that did NOT match any Levvy user. */
  assigneeName: string;
  /** Short, verb-led summary for preview. */
  summary: string;
  /** Original action-item text from the notes. */
  notes: string;
};

/**
 * Action items whose assignee names don't match any Levvy user. These are
 * client-side to-dos that can't become firm tasks, so they're sent to the
 * client (via email or Client Loop) instead.
 */
export function extractClientActionItems(notes: string): ClientActionItem[] {
  const items: ParsedItem[] = extractParsedItems(notes);
  return items
    .filter((it) => isClientAssignee(it.assigneeName))
    .map((it, index) => ({
      id: `${it.assigneeName?.trim() ?? "unknown"}:${it.notes}:${index}`,
      assigneeName: it.assigneeName!.trim(),
      summary: summarizeActionItem(it.notes),
      notes: it.notes,
    }));
}

/**
 * Pulls the text under a "Summary" heading, stopping at the next heading
 * (markdown `#` line or an "Action items" heading). Returns "" if none.
 */
export function extractSummarySection(notes: string): string {
  const lines = notes.split(/\r?\n/);
  const idx = lines.findIndex((l) =>
    /^#{0,6}\s*summary\s*:?\s*$/i.test(l.trim()),
  );
  if (idx === -1) return "";

  const out: string[] = [];
  for (let i = idx + 1; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed.startsWith("#")) break;
    if (/^action items?\s*:?\s*$/i.test(trimmed)) break;
    out.push(line);
  }
  return out.join("\n").trim();
}

/** Build the prefilled recap message body (summary + action items). */
export function buildRecapMessage(
  meetingTitle: string,
  summary: string,
  items: ClientActionItem[],
): string {
  const lines: string[] = ["Hi,", ""];
  lines.push(`Here's a recap from ${meetingTitle}.`);

  if (summary.trim()) {
    lines.push("", "Summary", summary.trim());
  }

  if (items.length > 0) {
    lines.push("", "Action items");
    for (const it of items) {
      lines.push(`\u2022 ${it.assigneeName}: ${it.summary}`);
    }
  }

  lines.push("", "Thanks!");
  return lines.join("\n");
}
