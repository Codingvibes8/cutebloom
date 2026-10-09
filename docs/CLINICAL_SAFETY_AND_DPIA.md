# CuteBloom — Clinical Safety Management & DPIA Starter

## 1. Clinical Safety Statement (DCB0129 / DCB0160 Principles)
CuteBloom is classified as a lifestyle and adherence tracking software aid. It is **NOT** a medical device (SaMD) under UK MHRA guidelines because:
1. It does not calculate, recommend, interpret, or alter medication dosages.
2. It does not diagnose ADHD or any co-morbid condition.
3. It does not provide direct clinical decision support or triage.

### Clinical Hazard & Risk Log Starter
| Hazard ID | Description | Potential Harm | Risk Severity | Mitigation Strategy |
|---|---|---|---|---|
| **HAZ-001** | User interprets missed dose notification as instruction to take double dose. | Medication overdose or acute side effects. | High | **Neutral missed-dose guidance**: CuteBloom displays a non-shaming notice: *"Check your patient information leaflet or contact your pharmacist / GP"*. Double dose instructions are explicitly prevented. |
| **HAZ-002** | User relies on app for controlled drug prescription continuity without buffer. | Abrupt medication cessation / withdrawal. | Medium | **Controlled Drug Mode**: Includes explicit 28-day validity warnings and requests refill reminders at least 7 days ahead. |
| **HAZ-003** | Timezone shift / Daylight Saving Time (DST) causes reminders to trigger at the wrong hour. | Dose taken too early or too late. | Medium | **IANA Timezone Awareness**: Schedules stored with explicit timezone (`Europe/London`). Local execution calculated against UTC offsets dynamically. |
| **HAZ-004** | Notification fatigue causes user to abandon adherence. | Reduced treatment compliance. | Low | **Gentle escalation**: Max 2 gentle follow-ups. Snooze options (10m). No loud intrusive guilt sounds or punitive streak loss. |

---

## 2. Data Protection Impact Assessment (DPIA) Outline
**Applicable Law**: UK General Data Protection Regulation (UK GDPR) & Data Protection Act 2018.

### Special Category Health Data (Article 9 UK GDPR)
- **Data Processed**: Medication names, dosages, time taken, daily focus, mood, sleep, appetite, and side effects.
- **Lawful Basis**: Article 6(1)(a) Consent + Article 9(2)(a) Explicit Consent for special-category health data.
- **Data Minimisation**: No collection of NHS numbers, national insurance, or unnecessary biometrics. Free-form text fields carry clear user guidance.
- **Storage & Isolation**: Row-Level Security (RLS) ensures complete cryptographic/tenant isolation within PostgreSQL.
- **Zero Third-Party Ad Leakage**: Strictly no third-party marketing pixels (Meta, Google Ads, TikTok), zero health attributes transmitted to analytical logging.
- **Right to Erasure & Portability**: Complete JSON data export and one-click account and data deletion provided in settings.
