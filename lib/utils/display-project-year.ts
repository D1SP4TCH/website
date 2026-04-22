/**
 * Normalize project year for UI: show a calendar year, never a full date string.
 */
export function displayProjectYear(
  value: string | number | undefined | null,
): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(Math.trunc(value)) : "";
  }
  const s = String(value).trim();
  if (!s) return "";
  if (/^\d{4}(-|$)/.test(s)) {
    return s.slice(0, 4);
  }
  if (/^\d{4}$/.test(s)) {
    return s;
  }
  const t = Date.parse(s);
  if (!Number.isNaN(t)) {
    return String(new Date(t).getFullYear());
  }
  const m = s.match(/\b(19|20)\d{2}\b/);
  return m ? m[0] : s;
}
