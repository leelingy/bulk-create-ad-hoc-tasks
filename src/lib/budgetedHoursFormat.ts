/** Duration as HH:MM for bulk task “budgeted hours” (not clock time; hours may exceed 23). */

const HHMM_RE = /^(\d{1,3}):(\d{2})$/;

export function normalizeBudgetedHoursToHHMM(raw: string): string {
  const t = raw.trim();
  if (!t) return "01:00";

  const m = HHMM_RE.exec(t);
  if (m) {
    const h = Math.min(999, Math.max(0, parseInt(m[1], 10)));
    const min = Math.min(59, Math.max(0, parseInt(m[2], 10)));
    return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  }

  const dec = t.replace(",", ".");
  if (/^\d*\.?\d+$/.test(dec)) {
    const num = parseFloat(dec);
    if (!Number.isNaN(num) && num >= 0) {
      const totalMin = Math.round(num * 60);
      const h = Math.min(999, Math.floor(totalMin / 60));
      const min = totalMin % 60;
      return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    }
  }

  return "01:00";
}
