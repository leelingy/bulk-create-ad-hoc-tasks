const LIST_PREFIX = /^\s*(?:[-*•]|\d+[\.)])\s*(.+)$/;

function isActionItemsHeading(line: string): boolean {
  const t = line.trim();
  if (!t) return false;
  const withoutHashes = t.replace(/^#{1,6}\s*/, "").replace(/\*+/g, "");
  return /\baction items?\b/i.test(withoutHashes);
}

function isMarkdownHeadingStart(line: string): boolean {
  return line.trim().startsWith("#");
}

function stripListPrefix(raw: string): string {
  const m = raw.match(LIST_PREFIX);
  if (m?.[1]) return m[1].trim();
  return raw.trim();
}

/**
 * Finds the first "Action item(s)" section and returns list item bodies below it.
 * Stops at the next markdown heading line (# …).
 * If no bullets are found, returns non-empty plain lines until the next heading.
 */
export function parseActionItems(text: string): string[] {
  const lines = text.split(/\r?\n/);
  const headingIdx = lines.findIndex(isActionItemsHeading);
  if (headingIdx === -1) return [];

  const bullets: string[] = [];
  const plain: string[] = [];

  for (let i = headingIdx + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (isMarkdownHeadingStart(line)) break;
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (LIST_PREFIX.test(line)) {
      bullets.push(stripListPrefix(line));
    } else {
      plain.push(trimmed);
    }
  }

  if (bullets.length > 0) return bullets;
  return plain;
}
