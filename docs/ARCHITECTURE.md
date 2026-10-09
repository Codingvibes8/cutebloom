# CuteBloom — Architecture & System Design Document

## 1. Overview
CuteBloom is an ADHD medication reminder, refill tracker, and focus companion for UK adults. This document specifies the Phase 1 architectural foundations covering data modeling, offline synchronization, authentication, and notification scheduling.

---

## 2. High-Level Architecture Diagram
```
  [ Next.js App Router (PWA) ]
      │
      ├── UI Layer: Tailwind CSS v4 + Accessible Tokens (WCAG 2.2 AA)
      ├── Local Storage: Dexie.js (IndexedDB) <── Offline-First Queue
      │       │
      │       └── Background Synchronization (Sync Engine)
      │               │
      └── Network Layer: Supabase SSR Client
              │
              ▼
  [ Supabase Cloud (PostgreSQL) ]
      ├── auth.users (Magic Link & Passkeys)
      ├── Row-Level Security (Strict Tenant Isolation: auth.uid() = user_id)
      └── Tables: profiles, medications, dose_logs, refill_trackers, 
                  daily_checkins, focus_sessions, consent_records
```

---

## 3. Data Model
All data is stored in PostgreSQL and mapped with Drizzle ORM:
- **`profiles`**: User metadata, UK timezone (`Europe/London`), accessibility settings (dyslexic font), app lock PIN hash, disclaimer acceptance timestamp.
- **`medications`**: Prescribed items with strength, form, schedule type (`fixed_times`, `multiple_daily`, `as_needed`), and controlled drug status. Free text only — no dosing advice or calculations.
- **`dose_logs`**: Timestamped logs (`taken`, `skipped`, `late`, `snoozed`) with client-generated UUIDs (`client_uuid`) for idempotent synchronization.
- **`refill_trackers`**: Supply on hand, days of supply left, request-by date, and controlled drug 28-day expiration tracking.
- **`daily_checkins`**: Micro-logging (&lt;15 seconds) covering focus, mood, sleep, appetite, and side-effect tags.
- **`focus_sessions`**: Low-friction momentum sessions ("Just Start" 5m, Pomodoro 25m, Custom).
- **`consent_records`**: UK GDPR special category health data explicit consent and disclaimer records.

---

## 4. Offline Synchronization Strategy
1. **Local-First Writes**: When offline or in guest mode, all actions write directly to IndexedDB via Dexie.
2. **Idempotent Queue**: Each record contains a `client_uuid` and `sync_status` (`synced` | `pending`).
3. **Reconciliation**:
   - On network reconnection (`window.addEventListener('online')`), pending items are batched and pushed to Supabase via upserts (`ON CONFLICT (client_uuid) DO NOTHING`).
   - If conflicts arise, the latest client timestamp wins for personal log entries.
4. **Account Upgrades**: When a guest user authenticates with Supabase Magic Link, local Dexie data is linked to the new user ID and synced upwards.

---

## 5. Security & UK GDPR Health Compliance
- **Tenant Isolation**: Row-Level Security (RLS) policies are active on 100% of tables. No user can read or write rows where `auth.uid() != user_id`.
- **Special-Category Health Data**: Zero telemetry, error tracker, or analytics ingestion of medication names, notes, or side effects.
- **Disclaimers**: Mandatory clinical notices make clear that CuteBloom is a personal log and reminder tool only, never a prescriber or medical diagnostic tool.
