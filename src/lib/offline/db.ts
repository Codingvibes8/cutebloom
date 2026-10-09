import Dexie, { type Table } from "dexie";

export interface LocalMedication {
  id: string; // client uuid or remote uuid
  name: string;
  form: string;
  strength?: string;
  scheduleType: string;
  scheduleTimes: string[];
  startDate: string;
  endDate?: string;
  notes?: string;
  isControlledDrug: boolean;
  isActive: boolean;
  syncStatus: "synced" | "pending_insert" | "pending_update" | "pending_delete";
  updatedAt: number;
}

export interface LocalDoseLog {
  id: string; // client uuid
  medicationId: string;
  scheduledTime: string;
  takenTime?: string;
  status: "taken" | "skipped" | "late" | "snoozed";
  notes?: string;
  syncStatus: "synced" | "pending";
  createdAt: number;
}

export interface LocalDailyCheckin {
  id: string; // client uuid
  date: string; // YYYY-MM-DD
  focusRating?: number;
  moodRating?: number;
  sleepHours?: number;
  sleepQuality?: number;
  appetiteRating?: number;
  sideEffects: string[];
  note?: string;
  syncStatus: "synced" | "pending";
  createdAt: number;
}

export interface LocalFocusSession {
  id: string;
  startedAt: string;
  durationMinutes: number;
  sessionType: "just_start_5m" | "pomodoro_25m" | "custom";
  completed: boolean;
  taskLabel?: string;
  syncStatus: "synced" | "pending";
  createdAt: number;
}

export interface GuestSettings {
  key: string;
  value: unknown;
}

class CuteBloomDatabase extends Dexie {
  medications!: Table<LocalMedication, string>;
  doseLogs!: Table<LocalDoseLog, string>;
  dailyCheckins!: Table<LocalDailyCheckin, string>;
  focusSessions!: Table<LocalFocusSession, string>;
  settings!: Table<GuestSettings, string>;

  constructor() {
    super("cutebloom_offline_db");
    this.version(1).stores({
      medications: "id, syncStatus, isActive, updatedAt",
      doseLogs: "id, medicationId, scheduledTime, syncStatus, createdAt",
      dailyCheckins: "id, date, syncStatus, createdAt",
      focusSessions: "id, sessionType, syncStatus, createdAt",
      settings: "key",
    });
  }
}

export const offlineDb = typeof window !== "undefined" ? new CuteBloomDatabase() : (null as unknown as CuteBloomDatabase);
