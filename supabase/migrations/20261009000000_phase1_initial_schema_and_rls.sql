-- ====================================================================
-- CuteBloom: Phase 1 Database Schema & Row-Level Security (RLS)
-- Special-Category UK GDPR Health Data Isolation & Auditability
-- ====================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  timezone TEXT NOT NULL DEFAULT 'Europe/London',
  dyslexic_font_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  app_lock_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  app_lock_pin_hash TEXT,
  theme TEXT NOT NULL DEFAULT 'system',
  medical_disclaimer_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 2. Medications Table
CREATE TABLE IF NOT EXISTS public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  form TEXT DEFAULT 'tablet',
  strength TEXT,
  schedule_type TEXT NOT NULL DEFAULT 'fixed_times',
  schedule_times JSONB NOT NULL DEFAULT '["08:00"]'::jsonb,
  start_date TEXT NOT NULL,
  end_date TEXT,
  notes TEXT,
  is_controlled_drug BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 3. Dose Logs Table (Idempotent offline sync via client_uuid)
CREATE TABLE IF NOT EXISTS public.dose_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMPTZ NOT NULL,
  taken_time TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('taken', 'skipped', 'late', 'snoozed')),
  client_uuid TEXT UNIQUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 4. Refill Trackers Table (Controlled Drug support)
CREATE TABLE IF NOT EXISTS public.refill_trackers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  current_quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'pills',
  days_supply_remaining INTEGER NOT NULL DEFAULT 0,
  request_by_date TEXT,
  last_refill_date TEXT,
  controlled_drug_expiry TEXT,
  early_reminder_days INTEGER NOT NULL DEFAULT 7,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 5. Daily Check-ins Table (<15s micro-logging)
CREATE TABLE IF NOT EXISTS public.daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  focus_rating INTEGER CHECK (focus_rating BETWEEN 1 AND 5),
  mood_rating INTEGER CHECK (mood_rating BETWEEN 1 AND 5),
  sleep_hours NUMERIC(4, 1),
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 5),
  appetite_rating INTEGER CHECK (appetite_rating BETWEEN 1 AND 5),
  side_effects JSONB NOT NULL DEFAULT '[]'::jsonb,
  note TEXT,
  client_uuid TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 6. Focus Sessions Table ("Just Start" 5m, Pomodoro, Custom)
CREATE TABLE IF NOT EXISTS public.focus_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('just_start_5m', 'pomodoro_25m', 'custom')),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  task_label TEXT,
  client_uuid TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 7. Consent Records (UK GDPR special category compliance & medical disclaimer)
CREATE TABLE IF NOT EXISTS public.consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('medical_disclaimer', 'health_data_gdpr', 'web_push')),
  granted BOOLEAN NOT NULL DEFAULT TRUE,
  policy_version TEXT NOT NULL DEFAULT '1.0',
  granted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ====================================================================
-- Performance Indexes
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_medications_user_active ON public.medications(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_dose_logs_user_med ON public.dose_logs(user_id, medication_id);
CREATE INDEX IF NOT EXISTS idx_dose_logs_scheduled ON public.dose_logs(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date ON public.daily_checkins(user_id, date);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user ON public.focus_sessions(user_id, started_at);

-- ====================================================================
-- Enable Row-Level Security (RLS) on all tables
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dose_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refill_trackers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- Strict Tenant Isolation Policies (auth.uid() = user_id)
-- ====================================================================

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Medications policies
CREATE POLICY "Users can view own medications"
  ON public.medications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medications"
  ON public.medications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medications"
  ON public.medications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own medications"
  ON public.medications FOR DELETE
  USING (auth.uid() = user_id);

-- Dose Logs policies
CREATE POLICY "Users can view own dose logs"
  ON public.dose_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dose logs"
  ON public.dose_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dose logs"
  ON public.dose_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own dose logs"
  ON public.dose_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Refill Trackers policies
CREATE POLICY "Users can view own refill trackers"
  ON public.refill_trackers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own refill trackers"
  ON public.refill_trackers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own refill trackers"
  ON public.refill_trackers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own refill trackers"
  ON public.refill_trackers FOR DELETE
  USING (auth.uid() = user_id);

-- Daily Checkins policies
CREATE POLICY "Users can view own daily checkins"
  ON public.daily_checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily checkins"
  ON public.daily_checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily checkins"
  ON public.daily_checkins FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily checkins"
  ON public.daily_checkins FOR DELETE
  USING (auth.uid() = user_id);

-- Focus Sessions policies
CREATE POLICY "Users can view own focus sessions"
  ON public.focus_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own focus sessions"
  ON public.focus_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own focus sessions"
  ON public.focus_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own focus sessions"
  ON public.focus_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Consent Records policies
CREATE POLICY "Users can view own consent records"
  ON public.consent_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consent records"
  ON public.consent_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ====================================================================
-- Automated profile trigger on auth.users signup
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
