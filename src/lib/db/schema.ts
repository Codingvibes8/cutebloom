import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  numeric,
  jsonb,
} from "drizzle-orm/pg-core";

// 1. User Profiles & ADHD Preferences
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // maps to auth.users.id
  email: text("email"),
  displayName: text("display_name"),
  timezone: text("timezone").default("Europe/London").notNull(),
  dyslexicFontEnabled: boolean("dyslexic_font_enabled").default(false).notNull(),
  appLockEnabled: boolean("app_lock_enabled").default(false).notNull(),
  appLockPinHash: text("app_lock_pin_hash"),
  theme: text("theme").default("system").notNull(),
  medicalDisclaimerAcceptedAt: timestamp("medical_disclaimer_accepted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 2. Medications
export const medications = pgTable("medications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  form: text("form").default("tablet"), // tablet, capsule, liquid, patch, etc.
  strength: text("strength"), // e.g. "30mg", "5mg"
  scheduleType: text("schedule_type").default("fixed_times").notNull(), // fixed_times, multiple_daily, as_needed
  scheduleTimes: jsonb("schedule_times").$type<string[]>().default(["08:00"]).notNull(),
  startDate: text("start_date").notNull(), // YYYY-MM-DD
  endDate: text("end_date"), // YYYY-MM-DD or null for ongoing
  notes: text("notes"),
  isControlledDrug: boolean("is_controlled_drug").default(false).notNull(), // Controlled drug tracking in UK
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 3. Dose Logs (Timestamped history, shame-free status)
export const doseLogs = pgTable("dose_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  medicationId: uuid("medication_id").references(() => medications.id, { onDelete: "cascade" }).notNull(),
  scheduledTime: timestamp("scheduled_time", { withTimezone: true }).notNull(),
  takenTime: timestamp("taken_time", { withTimezone: true }),
  status: text("status").notNull(), // 'taken', 'skipped', 'late', 'snoozed'
  clientUuid: text("client_uuid").unique(), // For offline-first sync idempotency
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 4. Refill Trackers (Controlled drug support)
export const refillTrackers = pgTable("refill_trackers", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  medicationId: uuid("medication_id").references(() => medications.id, { onDelete: "cascade" }).notNull(),
  currentQuantity: integer("current_quantity").default(0).notNull(),
  unit: text("unit").default("pills").notNull(),
  daysSupplyRemaining: integer("days_supply_remaining").default(0).notNull(),
  requestByDate: text("request_by_date"), // YYYY-MM-DD
  lastRefillDate: text("last_refill_date"), // YYYY-MM-DD
  controlledDrugExpiry: text("controlled_drug_expiry"), // 28-day CD prescription expiry
  earlyReminderDays: integer("early_reminder_days").default(7).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 5. Daily Check-in (<15s)
export const dailyCheckins = pgTable("daily_checkins", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  focusRating: integer("focus_rating"), // 1-5
  moodRating: integer("mood_rating"), // 1-5
  sleepHours: numeric("sleep_hours"), // e.g. 7.5
  sleepQuality: integer("sleep_quality"), // 1-5
  appetiteRating: integer("appetite_rating"), // 1-5
  sideEffects: jsonb("side_effects").$type<string[]>().default([]).notNull(),
  note: text("note"),
  clientUuid: text("client_uuid").unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 6. Focus Sessions ("Just Start" 5m, Pomodoro, Custom)
export const focusSessions = pgTable("focus_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  durationMinutes: integer("duration_minutes").notNull(),
  sessionType: text("session_type").notNull(), // 'just_start_5m', 'pomodoro_25m', 'custom'
  completed: boolean("completed").default(false).notNull(),
  taskLabel: text("task_label"),
  clientUuid: text("client_uuid").unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 7. Consent Records (UK GDPR special category compliance)
export const consentRecords = pgTable("consent_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  consentType: text("consent_type").notNull(), // 'medical_disclaimer', 'health_data_gdpr', 'web_push'
  granted: boolean("granted").default(true).notNull(),
  policyVersion: text("policy_version").default("1.0").notNull(),
  grantedAt: timestamp("granted_at", { withTimezone: true }).defaultNow().notNull(),
});
