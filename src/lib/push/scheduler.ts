/**
 * CuteBloom Reminder Scheduling Engine
 * 
 * Client-side scheduler that checks for due medication reminders
 * and triggers notifications. DST-safe for Europe/London timezone.
 * 
 * - Checks every 30 seconds for due reminders
 * - Shows notification with actions: Taken, Snooze 10m, Skip
 * - Escalation: max 2 gentle follow-ups at 15-minute intervals
 * - Snooze: max 3 snoozes, 10 minutes each
 */

import {
  getLondonDate,
  londonLocalToUtc,
  getNextOccurrence,
  isReminderDue,
  showNotification,
} from "./notifications";

const CHECK_INTERVAL_MS = 30_000; // Check every 30 seconds
const ESCALATION_INTERVAL_MS = 15 * 60_000; // 15 minutes
const MAX_ESCALATIONS = 2;
const SNOOZE_DURATION_MS = 10 * 60_000; // 10 minutes
const MAX_SNOOZES = 3;

export interface ReminderState {
  medicationId: string;
  medicationName: string;
  scheduledTime: Date;
  status: "notified" | "snoozed" | "acknowledged" | "escalated";
  notifiedAt: Date;
  snoozeCount: number;
  escalationCount: number;
  lastReminderAt: Date;
}

export interface SchedulerConfig {
  onReminderDue: (state: ReminderState) => void;
  onEscalation: (state: ReminderState) => void;
  onSnooze: (state: ReminderState, snoozeUntil: Date) => void;
}

/**
 * Reminder Scheduler class.
 * Manages the lifecycle of medication reminders.
 */
export class ReminderScheduler {
  private medications: Array<{
    id: string;
    name: string;
    scheduleTimes: string[];
    isActive: boolean;
  }> = [];
  private reminderStates = new Map<string, ReminderState>();
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private config: SchedulerConfig;
  private snoozeTimers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(config: SchedulerConfig) {
    this.config = config;
  }

  /**
   * Start the scheduler.
   */
  start(
    medications: Array<{
      id: string;
      name: string;
      scheduleTimes: string[];
      isActive: boolean;
    }>
  ): void {
    this.medications = medications;
    this.stop(); // Clear any existing interval

    // Do an immediate check
    this.checkReminders();

    // Then check every 30 seconds
    this.intervalId = setInterval(() => this.checkReminders(), CHECK_INTERVAL_MS);
  }

  /**
   * Stop the scheduler.
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    // Clear all snooze timers
    this.snoozeTimers.forEach((timer) => clearTimeout(timer));
    this.snoozeTimers.clear();
  }

  /**
   * Update the medications list.
   */
  updateMedications(
    medications: Array<{
      id: string;
      name: string;
      scheduleTimes: string[];
      isActive: boolean;
    }>
  ): void {
    this.medications = medications;
  }

  /**
   * Handle a notification action from the user.
   */
  handleAction(action: string, reminderKey: string): void {
    const state = this.reminderStates.get(reminderKey);
    if (!state) return;

    switch (action) {
      case "taken":
        state.status = "acknowledged";
        this.config.onReminderDue(state);
        break;
      case "skip":
        state.status = "acknowledged";
        this.config.onReminderDue(state);
        break;
      case "snooze":
        if (state.snoozeCount < MAX_SNOOZES) {
          state.snoozeCount++;
          state.status = "snoozed";
          state.lastReminderAt = new Date();
          const snoozeUntil = new Date(Date.now() + SNOOZE_DURATION_MS);
          this.config.onSnooze(state, snoozeUntil);
          this.scheduleSnooze(reminderKey, state, snoozeUntil);
        }
        break;
    }
  }

  /**
   * Get all active reminder states.
   */
  getActiveReminders(): ReminderState[] {
    return Array.from(this.reminderStates.values()).filter(
      (s) => s.status !== "acknowledged"
    );
  }

  /**
   * Clear all reminder states.
   */
  clear(): void {
    this.reminderStates.clear();
    this.snoozeTimers.forEach((timer) => clearTimeout(timer));
    this.snoozeTimers.clear();
  }

  // --- Private methods ---

  private checkReminders(): void {
    const now = new Date();

    for (const med of this.medications) {
      if (!med.isActive) continue;

      for (const time of med.scheduleTimes) {
        const reminderKey = this.getReminderKey(med.id, time, now);
        const existingState = this.reminderStates.get(reminderKey);

        if (!existingState) {
          // New reminder - check if it's due
          if (isReminderDue(time, now)) {
            this.triggerReminder(med, time, now, reminderKey);
          }
        } else if (existingState.status === "notified" || existingState.status === "escalated") {
          // Check for escalation
          const timeSinceNotification = now.getTime() - existingState.lastReminderAt.getTime();
          if (
            timeSinceNotification >= ESCALATION_INTERVAL_MS &&
            existingState.escalationCount < MAX_ESCALATIONS
          ) {
            this.triggerEscalation(med, time, now, reminderKey, existingState);
          }
        }
      }
    }
  }

  private triggerReminder(
    med: { id: string; name: string },
    time: string,
    now: Date,
    reminderKey: string
  ): void {
    const scheduledTime = londonLocalToUtc(getLondonDate(now), time);

    const state: ReminderState = {
      medicationId: med.id,
      medicationName: med.name,
      scheduledTime,
      status: "notified",
      notifiedAt: now,
      snoozeCount: 0,
      escalationCount: 0,
      lastReminderAt: now,
    };

    this.reminderStates.set(reminderKey, state);

    // Show notification
    void showNotification({
      title: `Time for ${med.name}`,
      body: `Scheduled time: ${time}. Tap an action below when you're ready.`,
      tag: `cutebloom-${med.id}-${time}`,
      requireInteraction: true,
      actions: [
        { action: "taken", title: "Taken" },
        { action: "snooze", title: "Snooze 10m" },
        { action: "skip", title: "Skip" },
      ],
      data: { reminderKey, medicationId: med.id, scheduledTime: scheduledTime.toISOString() },
    });

    this.config.onReminderDue(state);
  }

  private triggerEscalation(
    med: { id: string; name: string },
    time: string,
    now: Date,
    reminderKey: string,
    state: ReminderState
  ): void {
    state.escalationCount++;
    state.status = "escalated";
    state.lastReminderAt = now;

    // Show gentle escalation notification
    void showNotification({
      title: `Still waiting for ${med.name}`,
      body: `This is a gentle reminder. No pressure — just check in when you're ready.`,
      tag: `cutebloom-${med.id}-${time}-escalation-${state.escalationCount}`,
      requireInteraction: true,
      actions: [
        { action: "taken", title: "Taken" },
        { action: "snooze", title: "Snooze 10m" },
        { action: "skip", title: "Skip" },
      ],
      data: { reminderKey, medicationId: med.id, scheduledTime: state.scheduledTime.toISOString() },
    });

    this.config.onEscalation(state);
  }

  private scheduleSnooze(
    reminderKey: string,
    state: ReminderState,
    snoozeUntil: Date
  ): void {
    const delay = snoozeUntil.getTime() - Date.now();
    if (delay <= 0) return;

    const timer = setTimeout(() => {
      this.snoozeTimers.delete(reminderKey);
      state.status = "notified";
      state.lastReminderAt = new Date();

      void showNotification({
        title: `Snooze over — ${state.medicationName}`,
        body: `Your 10-minute snooze is up. Whenever you're ready.`,
        tag: `cutebloom-${state.medicationId}-snooze`,
        requireInteraction: true,
        actions: [
          { action: "taken", title: "Taken" },
          { action: "snooze", title: "Snooze 10m" },
          { action: "skip", title: "Skip" },
        ],
        data: {
          reminderKey,
          medicationId: state.medicationId,
          scheduledTime: state.scheduledTime.toISOString(),
        },
      });

      this.config.onReminderDue(state);
    }, delay);

    this.snoozeTimers.set(reminderKey, timer);
  }

  private getReminderKey(medicationId: string, time: string, now: Date): string {
    const dateStr = getLondonDate(now);
    return `${medicationId}-${dateStr}-${time}`;
  }
}

// Singleton instance
let schedulerInstance: ReminderScheduler | null = null;

export function getReminderScheduler(config: SchedulerConfig): ReminderScheduler {
  if (!schedulerInstance) {
    schedulerInstance = new ReminderScheduler(config);
  }
  return schedulerInstance;
}
