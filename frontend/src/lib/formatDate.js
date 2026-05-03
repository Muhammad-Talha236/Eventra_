import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

/**
 * Format a date string to "May 03, 2026" format
 * @param {string|Date} dateStr
 * @returns {string}
 */
export function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    try {
        const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
        if (!isValid(date)) return dateStr; // fallback to raw string
        return format(date, 'MMM dd, yyyy');
    } catch {
        return dateStr;
    }
}

/**
 * Format a date string to "May 03, 2026, 2:30 PM" format
 * @param {string|Date} dateStr
 * @returns {string}
 */
export function formatDateTime(dateStr) {
    if (!dateStr) return 'N/A';
    try {
        const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
        if (!isValid(date)) return dateStr;
        return format(date, 'MMM dd, yyyy, h:mm a');
    } catch {
        return dateStr;
    }
}

/**
 * Format a date to relative time, e.g. "2 hours ago"
 * @param {string|Date} dateStr
 * @returns {string}
 */
export function timeAgo(dateStr) {
    if (!dateStr) return '';
    try {
        const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
        if (!isValid(date)) return dateStr;
        return formatDistanceToNow(date, { addSuffix: true });
    } catch {
        return dateStr;
    }
}
