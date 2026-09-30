/**
 * Parse a YYYY-MM-DD date string without timezone shifting.
 * Treats the date as local midnight to avoid off-by-one errors.
 */
export function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  const cleanStr = typeof dateStr === 'string' ? dateStr.split('T')[0] : String(dateStr);
  const parts = cleanStr.split('-');
  if (parts.length !== 3) return null;
  const [year, month, day] = parts.map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return new Date(year, month - 1, day);
}

/**
 * Format a YYYY-MM-DD string into a user-friendly display.
 * e.g. "Oct 15, 2026"
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = parseLocalDate(dateStr);
  if (!date || isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Calculate the number of days remaining from today to a deadline.
 * Returns a number (can be negative if past).
 */
export function daysRemaining(deadlineStr) {
  if (!deadlineStr) return null;
  const deadline = parseLocalDate(deadlineStr);
  if (!deadline || isNaN(deadline.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = deadline.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get a human-friendly deadline label.
 */
export function deadlineLabel(deadlineStr) {
  const days = daysRemaining(deadlineStr);
  if (days === null) return '';
  if (days < 0) return 'Deadline passed';
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `${days} days left`;
}

/**
 * Get a CSS class modifier based on urgency.
 */
export function deadlineUrgency(deadlineStr) {
  const days = daysRemaining(deadlineStr);
  if (days === null) return 'normal';
  if (days < 0) return 'passed';
  if (days <= 2) return 'urgent';
  if (days <= 7) return 'soon';
  return 'normal';
}

/**
 * Format a YYYY-MM-DD string for use in an HTML date input value.
 */
export function toInputDate(dateStr) {
  if (!dateStr) return '';
  return typeof dateStr === 'string' ? dateStr.split('T')[0] : '';
}

/**
 * Get today's date as YYYY-MM-DD.
 */
export function todayString() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
