import Fuse from "fuse.js";
import { CLIENTS, type ClientName } from "./tenantUsers";

export function matchClientFromCell(
  cell: string,
): { name: ClientName } | null {
  const trimmed = cell.trim();
  if (!trimmed) return null;
  const fuse = new Fuse([...CLIENTS], { threshold: 0.4, ignoreLocation: true });
  const hit = fuse.search(trimmed)[0];
  if (hit && typeof hit.score === "number" && hit.score <= 0.45) {
    return { name: hit.item as ClientName };
  }
  return null;
}
