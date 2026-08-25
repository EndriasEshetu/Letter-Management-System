/**
 * Date formatting utilities for the SITA Letter Management System.
 * Converts raw ISO timestamps and date strings to human-readable display values.
 */

/**
 * Format a date string or ISO timestamp into a readable display format.
 * Examples:
 *   "2026-08-25T13:44:46Z"  →  "Aug 25, 2026 · 1:44 PM"
 *   "Mar 28, 2026"          →  "Mar 28, 2026"  (already formatted, returned as-is)
 *   null / undefined        →  "—"
 */
export function formatDate(value: string | null | undefined): string {
  if (!value || value === '—') return '—';

  // If it looks like it has already been formatted (no T or Z, has commas/spaces),
  // return it as-is to avoid double-formatting the mock data strings.
  if (!value.includes('T') && !value.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return value;
  }

  const date = new Date(value);
  if (isNaN(date.getTime())) return value; // invalid date — return raw

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).replace(',', ',').replace(', ', ' · ');
}

/**
 * Format just the date part (no time).
 * "2026-08-25T13:44:46Z"  →  "Aug 25, 2026"
 */
export function formatDateOnly(value: string | null | undefined): string {
  if (!value || value === '—') return '—';
  if (!value.includes('T') && !value.match(/^\d{4}-\d{2}-\d{2}$/)) return value;

  const date = new Date(value);
  if (isNaN(date.getTime())) return value;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format a date as a relative time string ("2 hours ago", "Yesterday", "3 days ago").
 * Falls back to formatDate for dates older than 7 days.
 */
export function formatRelativeDate(value: string | null | undefined): string {
  if (!value || value === '—') return '—';
  if (!value.includes('T') && !value.match(/^\d{4}-\d{2}-\d{2}$/)) return value;

  const date = new Date(value);
  if (isNaN(date.getTime())) return value;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return formatDateOnly(value);
}
