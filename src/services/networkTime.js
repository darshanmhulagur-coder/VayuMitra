// High-Precision Timezone-Aware Local Time Engine
// Provides accurate, dynamic Indian Standard Time (Asia/Kolkata) & Local Timezone handling
// Eliminates artificial clock drift and removes stale network offsets

// Purge any stale/erroneous network offset from prior sessions
if (typeof localStorage !== 'undefined') {
  try {
    localStorage.removeItem('weathergpt_network_time_offset');
  } catch (e) {
    // ignore
  }
}

/**
 * Returns the detected user timezone (defaults to 'Asia/Kolkata' for Indian meteorological focus)
 */
export function getUserTimezone() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) return tz;
  } catch (e) {
    // fallback
  }
  return 'Asia/Kolkata';
}

/**
 * Returns the current local Date object
 */
export function getLocalNow() {
  return new Date();
}

/**
 * Backward compatibility alias for getLocalNow
 */
export function getNetworkNow() {
  return new Date();
}

/**
 * Calibrates or syncs (no-op now since system clock with IANA timezone is ground truth)
 */
export function calibrateNetworkTime() {
  return new Date();
}

/**
 * Formats a Date into standard 12-hour local time (e.g., '08:45:12 PM' or '08:00 AM')
 */
export function formatLocalTime(date = new Date(), timezone = getUserTimezone(), includeSeconds = true) {
  try {
    const d = typeof date === 'number' || typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      ...(includeSeconds ? { second: '2-digit' } : {}),
      hour12: true
    }).format(d);
  } catch (e) {
    return date.toLocaleTimeString();
  }
}

/**
 * Formats a Date into a friendly localized full date string (e.g., 'Saturday, Oct 3, 2026')
 */
export function formatLocalDate(date = new Date(), timezone = getUserTimezone()) {
  try {
    const d = typeof date === 'number' || typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(d);
  } catch (e) {
    return date.toLocaleDateString();
  }
}

/**
 * Returns the ISO calendar date string 'YYYY-MM-DD' in the specified timezone
 */
export function getLocalISODate(date = new Date(), timezone = getUserTimezone()) {
  try {
    const d = typeof date === 'number' || typeof date === 'string' ? new Date(date) : date;
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(d);
    const y = parts.find(p => p.type === 'year')?.value;
    const m = parts.find(p => p.type === 'month')?.value;
    const day = parts.find(p => p.type === 'day')?.value;
    return `${y}-${m}-${day}`;
  } catch (e) {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }
}

/**
 * Returns the numeric 24-hour hour (0-23) in the specified timezone
 */
export function getLocalHour(date = new Date(), timezone = getUserTimezone()) {
  try {
    const d = typeof date === 'number' || typeof date === 'string' ? new Date(date) : date;
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false
    }).formatToParts(d);
    const hourVal = parts.find(p => p.type === 'hour')?.value;
    return parseInt(hourVal, 10);
  } catch (e) {
    return new Date(date).getHours();
  }
}

/**
 * Parses any API timestamp (ISO string, UTC, or epoch) into local timezone details
 */
export function parseApiTimestampToLocalDate(apiTimestamp, timezone = getUserTimezone()) {
  if (!apiTimestamp) {
    const now = new Date();
    return {
      isoDate: getLocalISODate(now, timezone),
      hour24: getLocalHour(now, timezone),
      timeFormatted: formatLocalTime(now, timezone, false),
      dateObj: now
    };
  }

  // Open-Meteo local format without timezone offset: 'YYYY-MM-DDTHH:MM'
  if (typeof apiTimestamp === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(apiTimestamp)) {
    const [datePart, timePart] = apiTimestamp.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    // Create Date in local timezone context
    const d = new Date(year, month - 1, day, hour, minute);
    const timeFormatted = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(d);
    return {
      isoDate: datePart,
      hour24: hour,
      minute,
      timeFormatted,
      dateObj: d
    };
  }

  // UTC or standard ISO with timezone offset
  const d = new Date(apiTimestamp);
  return {
    isoDate: getLocalISODate(d, timezone),
    hour24: getLocalHour(d, timezone),
    timeFormatted: formatLocalTime(d, timezone, false),
    dateObj: d
  };
}
