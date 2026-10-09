-- Phase 3: Reminder Engine — Push Subscriptions Table
-- Stores Web Push API subscriptions for VAPID-based notifications

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys_p256dh TEXT NOT NULL,
  keys_auth TEXT NOT NULL,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, endpoint)
);

-- Index for fast lookup by user
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(user_id, is_active);

-- Enable Row Level Security
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only manage their own push subscriptions
CREATE POLICY "Users can view own push subscriptions"
  ON push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own push subscriptions"
  ON push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own push subscriptions"
  ON push_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own push subscriptions"
  ON push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Reminder events table: tracks reminder state for escalation/snooze logic
CREATE TABLE IF NOT EXISTS reminder_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, acknowledged, snoozed, escalated, missed
  snooze_count INTEGER DEFAULT 0,
  escalation_count INTEGER DEFAULT 0,
  last_reminder_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  client_uuid TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reminder_events_user_id ON reminder_events(user_id);
CREATE INDEX IF NOT EXISTS idx_reminder_events_medication_id ON reminder_events(medication_id);
CREATE INDEX IF NOT EXISTS idx_reminder_events_status ON reminder_events(user_id, status);
CREATE INDEX IF NOT EXISTS idx_reminder_events_scheduled ON reminder_events(scheduled_time);

-- Enable RLS on reminder_events
ALTER TABLE reminder_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reminder events"
  ON reminder_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminder events"
  ON reminder_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminder events"
  ON reminder_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminder events"
  ON reminder_events FOR DELETE
  USING (auth.uid() = user_id);

-- Update updated_at trigger for both tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminder_events_updated_at
  BEFORE UPDATE ON reminder_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
