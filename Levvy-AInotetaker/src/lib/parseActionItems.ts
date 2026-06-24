/** Strip HTML tags and decode common entities to plain text lines. */
export function htmlToPlainText(html: string): string {
  const el = document.createElement("div");
  el.innerHTML = html;
  return (el.textContent ?? el.innerText ?? "").replace(/\u00a0/g, " ");
}

const LIST_PREFIX = /^\s*(?:[-*•]|\d+[\.)])\s*(.+)$/;
const GRANOLA_SUFFIX = /^(.+?)\s*\(([^)]+)\)\s*$/;
const ACTION_HEADING = /\baction items?\b/i;

function isActionItemsHeading(line: string): boolean {
  const t = line.trim();
  if (!t) return false;
  const withoutHashes = t.replace(/^#{1,6}\s*/, "").replace(/\*+/g, "");
  return ACTION_HEADING.test(withoutHashes);
}

function isMarkdownHeadingStart(line: string): boolean {
  return line.trim().startsWith("#");
}

function stripListPrefix(raw: string): string {
  const m = raw.match(LIST_PREFIX);
  if (m?.[1]) return m[1].trim();
  return raw.trim();
}

export type RawParsedLine = {
  text: string;
  assigneeName?: string;
};

/**
 * Parse Granola-style trailing (Name) from a line.
 */
function parseGranolaLine(line: string): RawParsedLine | null {
  const trimmed = stripListPrefix(line);
  if (!trimmed) return null;
  const m = trimmed.match(GRANOLA_SUFFIX);
  if (m) {
    return { text: m[1].trim(), assigneeName: m[2].trim() };
  }
  return { text: trimmed };
}

/**
 * Returns true if the line looks like a standalone assignee header (Zoom format).
 */
export function looksLikeAssigneeHeader(
  line: string,
  knownNames: string[],
): boolean {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 60) return false;
  if (LIST_PREFIX.test(line)) return false;
  if (trimmed.includes(".") && trimmed.split(/\s+/).length > 4) return false;
  const lower = trimmed.toLowerCase();
  return knownNames.some(
    (n) =>
      n.toLowerCase() === lower ||
      n.toLowerCase().startsWith(lower) ||
      lower.startsWith(n.toLowerCase().split(/\s+/)[0] ?? ""),
  );
}

function findActionSectionLines(text: string): string[] {
  const lines = text.split(/\r?\n/);
  const headingIdx = lines.findIndex(isActionItemsHeading);
  if (headingIdx === -1) {
    return lines.filter((l) => l.trim().length > 0);
  }
  const section: string[] = [];
  for (let i = headingIdx + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (isMarkdownHeadingStart(line)) break;
    if (line.trim()) section.push(line);
  }
  return section;
}

/**
 * Format-aware action item extraction from plain text (after HTML strip).
 */
export function parseActionItemsFromText(
  text: string,
  knownAssigneeNames: string[] = [],
): RawParsedLine[] {
  const lines = findActionSectionLines(text);
  if (lines.length === 0) return [];

  const hasBullets = lines.some((l) => LIST_PREFIX.test(l));
  const hasGranola = lines.some((l) => GRANOLA_SUFFIX.test(stripListPrefix(l)));

  if (hasGranola || hasBullets) {
    const items: RawParsedLine[] = [];
    for (const line of lines) {
      if (isActionItemsHeading(line)) continue;
      const parsed = parseGranolaLine(line);
      if (parsed && parsed.text.length > 0) items.push(parsed);
    }
    if (items.length > 0) return items;
  }

  // Zoom: assignee header blocks
  const zoomItems: RawParsedLine[] = [];
  let currentAssignee: string | undefined;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (looksLikeAssigneeHeader(trimmed, knownAssigneeNames)) {
      currentAssignee = trimmed;
      continue;
    }
    const body = stripListPrefix(line);
    if (body) {
      zoomItems.push({ text: body, assigneeName: currentAssignee });
    }
  }

  if (zoomItems.length > 0) return zoomItems;

  return lines
    .map((l) => parseGranolaLine(l))
    .filter((p): p is RawParsedLine => !!p && p.text.length > 0);
}

export function parseActionItems(
  htmlOrText: string,
  knownAssigneeNames: string[] = [],
): RawParsedLine[] {
  const plain = htmlOrText.includes("<")
    ? htmlToPlainText(htmlOrText)
    : htmlOrText;
  return parseActionItemsFromText(plain, knownAssigneeNames);
}
