# CuteBloom — ADHD Medication-Reminder & Focus App

> **A gentle, shame-free medication reminder, refill tracker, and focus companion for UK adults with ADHD.**

CuteBloom is built to minimize executive dysfunction, support neurodivergent workflows, and ensure complete data privacy under UK GDPR special-category health standards.

---

## 🌿 Core Features

1. **Shame-Free Medication & Dose Logging**: Track medication without punitive streaks, anxiety alerts, or guilt copy.
2. **Controlled-Drug Refill Awareness**: 28-day single-issue UK prescription tracking with early buffer reminders.
3. **<15-Second Daily Check-Ins**: Quick chips for focus, mood, sleep, appetite, and side effects.
4. **"Just Start" 5-Minute Focus Momentum**: Low-friction momentum timers to help break task inertia.
5. **Offline-First Resilience**: Dexie.js (IndexedDB) client database with background sync to Supabase PostgreSQL.
6. **Accessible Design**: Calm botanical palette (Sage / Warm Oat / Soft Lavender), WCAG 2.2 AA compliant, 44px+ tap targets, OpenDyslexic font toggle.
7. **Clinical Safety & Legal Compliance**: Explicit medical disclaimer; zero automated dose adjustments or diagnosis.

---

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router), React 19, TypeScript (strict mode)
- **Styling**: Tailwind CSS v4, shadcn/ui accessible component tokens
- **Database & Auth**: PostgreSQL (Supabase) + Drizzle ORM with Row-Level Security (RLS)
- **Offline & PWA**: Dexie.js (IndexedDB) + PWA Web App Manifest and Service Worker
- **Timezone**: London (`Europe/London`), UK date formats (`DD/MM/YYYY`)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (Node 24 recommended)
- npm 10+

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Codingvibes8/cutebloom.git
cd cutebloom

# Install dependencies
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
NEXT_PUBLIC_APP_TIMEZONE=Europe/London

# VAPID Keys for Web Push Notifications (Phase 3)
# Generate with: npx web-push generate-vapid-keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:hello@cutebloom.app

# Cron secret for server-side reminder checker (optional but recommended)
CRON_SECRET=your-random-secret-here
```

### 4. Supabase Database Migration
To apply the Phase 1 schema and Row-Level Security (RLS) policies:
1. Open your Supabase Dashboard -> **SQL Editor**.
2. Run the SQL scripts located in [`supabase/migrations/`](supabase/migrations/):
1. [`20261009000000_phase1_initial_schema_and_rls.sql`](supabase/migrations/20261009000000_phase1_initial_schema_and_rls.sql) — Core tables, RLS policies, indexes
2. [`20261009000001_phase3_push_subscriptions.sql`](supabase/migrations/20261009000001_phase3_push_subscriptions.sql) — Push subscriptions and reminder events tables

### 5. Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

---

## 🗺️ Roadmap & Phases

- [x] **Phase 1: Foundation** — Project setup, design system (calm ADHD palette, accessible tokens), Supabase Auth SSR, database schema & RLS, offline Dexie store, PWA shell.
- [x] **Phase 2: Medications & Dose Logging** — Medication creation, shame-free dose logs, Dexie offline queue sync.
- [x] **Phase 3: Reminder Engine** — VAPID Web Push, persistent actions (`Taken`, `Snooze 10m`, `Skip`), DST/timezone scheduling, escalation nudges, client-side scheduler, server-side cron endpoint.
- [ ] **Phase 4: Refill Tracker & Check-in** — Controlled drug management & 15-second daily check-in.
- [ ] **Phase 5: Focus Tools & Insights** — "Just Start" 5-minute timer, Pomodoro, and descriptive adherence charts.
- [ ] **Phase 6: Prescriber Reports & Data Controls** — PDF/CSV clinical export, full GDPR data export & deletion.
- [ ] **Phase 7: Hardening** — WCAG 2.2 AA audit, security checks, E2E tests, Capacitor mobile wrapper guide.

---

## 📄 Documentation
- [agent.md](agent.md) — Product specification & requirements.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — System architecture, data model, offline sync.
- [docs/CLINICAL_SAFETY_AND_DPIA.md](docs/CLINICAL_SAFETY_AND_DPIA.md) — Hazard log (DCB0129) and UK GDPR DPIA outline.
