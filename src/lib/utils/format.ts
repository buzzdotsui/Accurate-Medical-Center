import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

// ---------------------------------------------------------------------------
// Date Formatting
// ---------------------------------------------------------------------------

/**
 * Format a date for display in the UI (e.g., "Aug 6, 2026").
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '—';
  return format(d, 'MMM d, yyyy');
}

/**
 * Format a date with time (e.g., "Aug 6, 2026, 10:30 AM").
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '—';
  return format(d, 'MMM d, yyyy, h:mm a');
}

/**
 * Format time only (e.g., "10:30 AM").
 */
export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '—';
  return format(d, 'h:mm a');
}

/**
 * Format date relative to now (e.g., "3 hours ago", "in 2 days").
 */
export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '—';
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Format a date for use in HTML date inputs (e.g., "2026-08-06").
 */
export function formatDateInput(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  return format(d, 'yyyy-MM-dd');
}

// ---------------------------------------------------------------------------
// Currency Formatting
// ---------------------------------------------------------------------------

/**
 * Format an amount in Nigerian Naira.
 * e.g., formatCurrency(15000) → "₦15,000.00"
 */
export function formatCurrency(
  amount: number | null | undefined,
  options?: { showSymbol?: boolean; decimals?: number },
): string {
  if (amount === null || amount === undefined) return '—';
  const { showSymbol = true, decimals = 2 } = options ?? {};
  const formatted = new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
  return showSymbol ? `₦${formatted}` : formatted;
}

// ---------------------------------------------------------------------------
// Phone Formatting
// ---------------------------------------------------------------------------

/**
 * Format a Nigerian phone number for display.
 * e.g., "08012345678" → "0801 234 5678"
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '—';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  if (cleaned.length === 13 && cleaned.startsWith('234')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  return phone;
}

// ---------------------------------------------------------------------------
// Name Formatting
// ---------------------------------------------------------------------------

/**
 * Format a full name from parts.
 */
export function formatFullName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  middleName?: string | null,
): string {
  const parts = [firstName, middleName, lastName].filter(Boolean);
  return parts.join(' ') || '—';
}

/**
 * Get initials from a name (max 2 characters).
 * e.g., "John Doe" → "JD"
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0].toUpperCase())
    .slice(0, 2)
    .join('');
}

// ---------------------------------------------------------------------------
// Number Formatting
// ---------------------------------------------------------------------------

/**
 * Format a number with commas (e.g., 10000 → "10,000").
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-NG').format(value);
}

/**
 * Format a file size in human-readable format.
 * e.g., 1024 → "1 KB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
