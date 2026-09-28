import { format } from "date-fns";

/**
 * Format a date as dd/MM/yyyy — used for general date display across the app.
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  try {
    return format(new Date(date), "dd/MM/yyyy");
  } catch {
    return "—";
  }
}

/**
 * Format a date of birth as dd/MM only — the year is intentionally hidden
 * for patient privacy when viewing profiles. Only shows day and month.
 */
export function formatDOB(date: Date | string | null | undefined): string {
  if (!date) return "Not recorded";
  try {
    return format(new Date(date), "dd/MM");
  } catch {
    return "Not recorded";
  }
}

/**
 * Calculate age from date of birth without exposing the actual year.
 * Returns a string like "32 yrs" for age display.
 */
export function calculateAge(date: Date | string | null | undefined): string {
  if (!date) return "";
  try {
    const d = new Date(date);
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const monthDiff = now.getMonth() - d.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < d.getDate())) age--;
    return `${age} yrs`;
  } catch {
    return "";
  }
}
