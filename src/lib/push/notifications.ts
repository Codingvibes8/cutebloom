/**
 * CuteBloom Notification Helpers
 * 
 * DST-safe notification scheduling and display for medication reminders.
 * All time computations use Europe/London timezone.
 */

const LONDON_TIMEZONE = "Europe/London";

/**
 * Get the current date in London timezone as YYYY-MM-DD
 */
export function getLondonDate(now: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: LONDON_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(now);
  const day = parts.find((p) => p.type === "day")?.value || "01";
  const month = parts.find((p) => p.type === "month")?.value || "01";
  const year = parts.find((p) => p.type === "year")?.value || "2024";
  return `${year}-${month}-${day}`;
}

/**
 * Get the current time in London timezone as HH:mm
 */
export function getLondonTime(now: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: LONDON_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return formatter.format(now);
}

/**
 * Convert a London local date+time to a UTC Date object.
 * DST-safe: uses Intl.DateTimeFormat to handle transitions correctly.
 * 
 * @param dateStr - Date in YYYY-MM-DD format (London local date)
 * @param timeStr - Time in HH:mm format (London local time)
 * @returns UTC Date object representing the specified London local time
 */
export function londonLocalToUtc(dateStr: string, timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);

  // Create a UTC date for the target time
  const utcDateStr = `${dateStr}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00Z`;
  const candidate = new Date(utcDateStr);

  // Check what London time this UTC date corresponds to
  const londonFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: LONDON_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const candidateLondonParts = londonFormatter.formatToParts(candidate);
  const candidateLondonHour = parseInt(
    candidateLondonParts.find((p) => p.type === "hour")?.value || "0",
    10
  );
  const candidateLondonMinute = parseInt(
    candidateLondonParts.find((p) => p.type === "minute")?.value || "0",
    10
  );

  // Calculate the difference between target and actual
  const targetTotalMinutes = hours * 60 + minutes;
  const candidateTotalMinutes = candidateLondonHour * 60 + candidateLondonMinute;
  const diffMinutes = targetTotalMinutes - candidateTotalMinutes;

  // Adjust the candidate to get the correct UTC time
  return new Date(candidate.getTime() + diffMinutes * 60 * 1000);
}

/**
 * Get the next occurrence of a scheduled time in London timezone.
 * If the time has already passed today, returns tomorrow's occurrence.
 * 
 * @param scheduleTime - Time in HH:mm format
 * @param now - Current date (defaults to now)
 * @returns Date object for the next occurrence
 */
export function getNextOccurrence(scheduleTime: string, now: Date = new Date()): Date {
  const todayStr = getLondonDate(now);
  const nextToday = londonLocalToUtc(todayStr, scheduleTime);

  if (nextToday > now) {
    return nextToday;
  }

  // Time has passed today, schedule for tomorrow
  const tomorrow = new Date(nextToday);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return tomorrow;
}

/**
 * Check if a scheduled time is due (within the last 5 minutes or overdue)
 */
export function isReminderDue(
  scheduleTime: string,
  now: Date = new Date(),
  windowMinutes = 5
): boolean {
  const todayStr = getLondonDate(now);
  const scheduledUtc = londonLocalToUtc(todayStr, scheduleTime);
  const diffMs = now.getTime() - scheduledUtc.getTime();
  const windowMs = windowMinutes * 60 * 1000;
  return diffMs >= 0 && diffMs <= windowMs;
}

/**
 * Show a notification via the service worker.
 * Falls back to regular Notification API if SW is not available.
 */
export async function showNotification(options: {
  title: string;
  body: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{ action: string; title: string }>;
  data?: Record<string, unknown>;
}): Promise<boolean> {
  // Try service worker first (supports action buttons)
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.showNotification(options.title, {
          body: options.body,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          tag: options.tag || "cutebloom-reminder",
          requireInteraction: options.requireInteraction ?? true,
          data: options.data || {},
          // actions is not in the standard NotificationOptions type but is supported by browsers
          ...(options.actions ? { options: options.actions } : {}),
        } as NotificationOptions & { actions?: Array<{ action: string; title: string }> });
        return true;
      }
    } catch (error) {
      console.warn("[CuteBloom] Service worker notification failed, falling back:", error);
    }
  }

  // Fallback to regular Notification API
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(options.title, {
        body: options.body,
        icon: "/favicon.ico",
        tag: options.tag || "cutebloom-reminder",
        requireInteraction: options.requireInteraction ?? true,
        data: options.data || {},
      });
      return true;
    } catch (error) {
      console.warn("[CuteBloom] Notification API failed:", error);
    }
  }

  return false;
}

/**
 * Request notification permission from the user.
 * Returns the permission status.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    return "denied";
  }
  if (Notification.permission === "granted") {
    return "granted";
  }
  if (Notification.permission === "denied") {
    return "denied";
  }
  return await Notification.requestPermission();
}

/**
 * Check if notifications are supported and granted
 */
export function areNotificationsSupported(): boolean {
  return "Notification" in window;
}

export function areNotificationsGranted(): boolean {
  return areNotificationsSupported() && Notification.permission === "granted";
}
