import Fuse from "fuse.js";
import type { Contact, TenantUser } from "../types";

function tokenizeName(name: string): string[] {
  return name
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

function normalizeLineForAssigneeMatch(line: string): string {
  const trimmed = line.trim();
  const afterBullet = trimmed.replace(/^[\s\-*•\d\.\)]+/, "").trim();
  if (!afterBullet) return "";
  const afterLabel = afterBullet.replace(/^[^:]+:\s*/, "").trim();
  return afterLabel || afterBullet;
}

function firstWords(line: string, maxWords: number): string[] {
  const cleaned = line.trim();
  if (!cleaned) return [];
  const words = cleaned.split(/\s+/).filter(Boolean);
  return words.slice(0, maxWords);
}

export function matchAssigneeFromLineWithNotes(
  line: string,
  users: TenantUser[],
): { assignee: { id: string; name: string } | null; notes: string } {
  const trimmedLine = line.trim();
  const normalized = normalizeLineForAssigneeMatch(line);
  if (!normalized.trim() || users.length === 0) {
    return { assignee: null, notes: trimmedLine };
  }

  const fuse = new Fuse(
    users.map((u) => ({
      id: u.id,
      name: u.name,
      tokens: tokenizeName(u.name).join(" "),
    })),
    { keys: ["name", "tokens"], threshold: 0.35, ignoreLocation: true },
  );

  let best: { id: string; name: string; score: number; n: number } | null =
    null;
  for (let n = 3; n >= 1; n -= 1) {
    const slice = firstWords(normalized, n);
    if (slice.length === 0) continue;
    const q = slice.join(" ");
    const hit = fuse.search(q)[0];
    if (hit) {
      const score = typeof hit.score === "number" ? hit.score : 0;
      const id = hit.item.id;
      const name = hit.item.name;
      if (!best || score < best.score) {
        best = { id, name, score, n };
      }
    }
  }

  if (!best || best.score > 0.42) {
    return { assignee: null, notes: trimmedLine };
  }

  const words = normalized.split(/\s+/).filter(Boolean);
  const nameWordCount = tokenizeName(best.name).length;
  const stripCount = best.n > nameWordCount ? nameWordCount : best.n;
  const remainder = words.slice(stripCount).join(" ").trim();
  return {
    assignee: { id: best.id, name: best.name },
    notes: remainder,
  };
}

export function matchAssigneeFromLine(
  line: string,
  users: TenantUser[],
): { id: string; name: string } | null {
  return matchAssigneeFromLineWithNotes(line, users).assignee;
}

/**
 * Strip co-assignee noise so "Awais/team", "Awais & team", "Awais, Sam"
 * still resolve to the primary named person.
 */
function primaryNameFromCell(cell: string): string {
  return cell.split(/[/,&]| and /i)[0].trim();
}

export function matchUserFromCell(
  cell: string,
  users: TenantUser[],
): { id: string; name: string } | null {
  const trimmed = primaryNameFromCell(cell);
  if (!trimmed || users.length === 0) return null;

  const fuse = new Fuse(
    users.map((u) => ({
      id: u.id,
      name: u.name,
      tokens: tokenizeName(u.name).join(" "),
    })),
    { keys: ["name", "tokens"], threshold: 0.38, ignoreLocation: true },
  );

  const hit = fuse.search(trimmed)[0];
  if (!hit) return null;
  const score = typeof hit.score === "number" ? hit.score : 0;
  if (score <= 0.45) {
    return { id: hit.item.id, name: hit.item.name };
  }
  return null;
}

/**
 * Match a name against a client's contacts. Used to detect when an assignee
 * name is ambiguous (matches both a Levvy user and a client contact).
 */
export function matchContactFromName(
  name: string,
  contacts: Contact[],
): { id: string; name: string } | null {
  const trimmed = name.trim();
  if (!trimmed || contacts.length === 0) return null;

  const fuse = new Fuse(
    contacts.map((c) => ({
      id: c.id,
      name: c.name,
      tokens: tokenizeName(c.name).join(" "),
    })),
    { keys: ["name", "tokens"], threshold: 0.38, ignoreLocation: true },
  );

  const hit = fuse.search(trimmed)[0];
  if (!hit) return null;
  const score = typeof hit.score === "number" ? hit.score : 0;
  if (score <= 0.45) {
    return { id: hit.item.id, name: hit.item.name };
  }
  return null;
}
