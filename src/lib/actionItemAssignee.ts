import { matchUserFromCell } from "./matchAssignee";
import { TENANT_USERS } from "./tenantUsers";

/** True when the name matches a Levvy (firm) user — eligible for firm tasks. */
export function isFirmAssignee(name: string | undefined | null): boolean {
  if (!name?.trim()) return false;
  return matchUserFromCell(name.trim(), TENANT_USERS) !== null;
}

/** Client contacts and other non-Levvy assignees — not firm tasks. */
export function isClientAssignee(name: string | undefined | null): boolean {
  if (!name?.trim()) return false;
  return !isFirmAssignee(name);
}
