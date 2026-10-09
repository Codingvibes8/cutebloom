# CuteBloom — ADHD Medication-Reminder & Focus App

## Product Specification & Guidelines

### Overview
**CuteBloom** is an ADHD medication-reminder and focus companion built for adults with ADHD.
It helps users:
1. Remember and log medication without shame or friction.
2. Track prescription refills with controlled-drug awareness.
3. Record daily focus, mood, sleep, and side effects in under 15 seconds.
4. Start and sustain focus sessions using low-friction timers ("just start" 5-minute mode).

> **Clinical & Legal Notice**: CuteBloom is a tracking and reminder tool only. It must **NEVER** recommend, adjust, or interpret doses, diagnose, or claim to treat ADHD. Include a clear medical disclaimer in onboarding and settings. Target market: UK first (timezone `Europe/London`, UK date formats `DD/MM/YYYY`, British English).

---

## Tech Stack
- **Framework**: Next.js (latest stable), App Router, React Server Components, TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui, WCAG 2.2 AA compliant, accessible contrast & tap targets
- **Database & ORM**: PostgreSQL (Supabase) with Drizzle ORM and SQL migrations
- **Authentication**: Supabase Auth (`@supabase/ssr`) with email magic link + optional app lock / PIN / passkey
- **PWA & Offline**: Serwist / Next PWA service worker, Web App Manifest, offline-first logging via IndexedDB (Dexie) with background synchronization
- **Notifications**: Web Push (VAPID) with notification action buttons (`Taken`, `Snooze 10m`, `Skip`), Capacitor-ready architecture (no web-only assumptions in core logic)
- **Scheduling**: Timezone- and DST-safe reminder background engine (stores local time + IANA timezone `Europe/London`, computes UTC at execution)
- **Validation & Testing**: Zod schemas, Vitest + Playwright
- **Privacy & Telemetry**: Privacy-first, zero health-data leakage to analytics or logs

---

## Core Features (MVP)
1. **Onboarding**: Under 60 seconds, explicit medical disclaimer, optional guest/account setup, permission explanation in plain language.
2. **Medications**: Name, form, strength, schedule (fixed times, multiple times per day, as-needed), start/end dates, notes. Free text only, no built-in dosing advice.
3. **Reminders**: Persistent notifications with actions (Taken / Snooze 10 min / Skip). Escalation nudges if unacknowledged. Missed dose guidance is neutral ("Check your leaflet or ask your pharmacist").
4. **Dose Log**: Timestamped history, late and skipped flagged without shame language, fully editable.
5. **Refill Tracker**: Quantity on hand, days of supply left, "request by" date, early reminder. Support controlled-drug mode (single-issue prescriptions, no repeats, explicit prescription date and duration).
6. **Daily Check-in (<15s)**: Focus, mood, sleep, appetite, side-effect chips + optional short note.
7. **Focus Tools**: Pomodoro, custom timer, "Just Start" 5-minute momentum mode, task step breakdown, ambient sound generator.
8. **Insights**: Simple descriptive charts of adherence and effect ratings over time. No automated diagnosis or dosage advice.
9. **Prescriber Report**: PDF/CSV export with clear user-recorded disclaimer.
10. **Settings**: JSON data export, full account & data wipe, notification preferences, dark/light mode, OpenDyslexic / dyslexia-friendly font toggle.

---

## Security & Privacy (Special-Category Health Data under UK GDPR)
- Row-Level Security (RLS) ensuring strict tenant isolation.
- Sensitive fields encrypted or isolated.
- Zero health data in logs, error trackers, or telemetry.
- Secure CSP headers, CSRF protection, and rate limiting.
- Data export and GDPR deletion flows.

---

## Phased Roadmap
- [ ] **Phase 1**: Foundation — Project setup, design system (calm ADHD palette, shadcn/ui), Supabase Auth & SSR, database schema & RLS, PWA shell & service worker.
- [ ] **Phase 2**: Medications and dose logging with offline Dexie sync.
- [ ] **Phase 3**: Reminder engine — Scheduling, Web Push (VAPID), notification actions, timezone/DST verification.
- [ ] **Phase 4**: Refill tracker (with Controlled Drug support) & daily check-in.
- [ ] **Phase 5**: Focus tools & adherence insights.
- [ ] **Phase 6**: Prescriber report export (PDF/CSV), data export & account deletion.
- [ ] **Phase 7**: Hardening — WCAG 2.2 AA audit, security checks, E2E tests, Capacitor wrap documentation.
