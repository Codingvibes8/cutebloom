-- Phase 3: Reminder Engine — Reminder Settings, Push Subscriptions & Reminder Events
-- VAPID Web Push notifications, actionable nudges, DST-safe scheduling

-- Reminder Settings table
CREATE TABLE IF NOT EXISTS reminder_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  snooze_minutes INTEGER NOT NULL DEFAULT 10,
  escalation_enabled BOOLEAN NOT NULL DEFAULT true,
  escalation_minutes INTEGER NOT NULL DEFAULT 30,
  quiet_hours_start TEXT,
  quiet_hours_end TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Push Subscriptions table (VAPID)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys_p256dh TEXT NOT NULL,
  keys_auth TEXT NOT NULL,
  user_agent TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Reminder Events table (deduplication & tracking)
CREATE TABLE IF NOT EXISTS reminder_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  client_uuid TEXT,
  last_reminder_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reminder_settings_user_id ON reminder_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_reminder_events_user_id ON reminder_events(user_id);
CREATE INDEX IF NOT EXISTS idx_reminder_events_medication_id ON reminder_events(medication_id);
CREATE INDEX IF NOT EXISTS idx_reminder_events_status ON reminder_events(status);

-- RLS Policies
ALTER TABLE reminder_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reminder_settings_select_own" ON reminder_settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "reminder_settings_insert_own" ON reminder_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reminder_settings_update_own" ON reminder_settings
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reminder_settings_delete_own" ON reminder_settings
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "push_subscriptions_select_own" ON push_subscriptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "push_subscriptions_insert_own" ON push_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "push_subscriptions_update_own" ON push_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "push_subscriptions_delete_own" ON push_subscriptions
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "reminder_events_select_own" ON reminder_events
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "reminder_events_insert_own" ON reminder_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reminder_events_update_own" ON reminder_events
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reminder_events_delete_own" ON reminder_events
  FOR DELETE USING (auth.uid() = user_id);
