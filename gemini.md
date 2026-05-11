# 🧭 Expiry Guard — Project Constitution

> This file is **law**. All data schemas, behavioral rules, and architectural invariants live here.
> Only update when: a schema changes, a rule is added, or architecture is modified.

---

## 📦 Data Schema

### Input Shape (Raw Item Addition)
```json
{
  "eventId": "uuid",
  "timestamp": "ISO-8601",
  "source": "barcode | ocr | voice | manual",
  "rawData": {
    "barcode": "string (optional)",
    "text_snippet": "string (optional)",
    "audio_transcript": "string (optional)"
  },
  "parsedItem": {
    "name": "string",
    "quantity": "number",
    "unit": "string",
    "category": "food | medication | household",
    "estimatedExpiry": "ISO-8601 (optional)"
  }
}
```

### Output Shape (System Payload / DB Entity)
```json
{
  "itemId": "uuid",
  "userId": "uuid",
  "householdId": "uuid",
  "name": "string",
  "category": "string",
  "quantity": {
    "amount": "number",
    "unit": "string"
  },
  "storageLocation": "fridge | freezer | pantry | cabinet",
  "dates": {
    "addedAt": "ISO-8601",
    "expiresAt": "ISO-8601",
    "consumedAt": "ISO-8601 | null"
  },
  "status": "active | expiring_soon | expired | consumed | discarded",
  "financialValue": "number (optional)"
}
```

---

## 📐 Behavioral Rules
1. **Never Auto-Delete:** Items past expiry enter a "Pending Review" state. The user must explicitly mark them as 'consumed' or 'discarded'.
2. **Adaptive Alerts:** Highly perishable items (meat/dairy) alert 3 days prior. Stable items (canned goods) alert 14 days prior.
3. **Medication Segregation:** Medication alerts bypass standard notification logic, requiring explicit acknowledgment, and are visually distinct.
4. **Local-First:** All read/write operations execute against a local database first for zero-latency, syncing to the cloud asynchronously.
5. **Positive Reinforcement:** Focus messaging on "Money/Food Saved" rather than "Waste Created" to encourage continued use.

---

## 🏛️ Architectural Invariants
1. All business logic is deterministic (no LLM guessing).
2. Tools in `tools/` are atomic and testable.
3. Temporary files go in `.tmp/`.
4. Secrets/keys go in `.env` (never committed).
5. Architecture SOPs are updated **before** code changes.

---

## 🔧 Maintenance Log
| Date | Change | Reason |
|------|--------|--------|
| 2026-05-10 | Project initialized | Protocol 0 |
