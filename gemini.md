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
1. **The 30-Second Rule:** The core loop (Scan $\rightarrow$ Populate) must take less than 30 seconds.
2. **Scanner-First:** The app must launch directly into the Scanner/Camera by default.
3. **Never Auto-Delete:** Items past expiry enter "The Graveyard". Users must explicitly mark them as 'consumed' or 'discarded'.
4. **Visual Urgency:** Item timers must transition from Green (Safe) $\rightarrow$ Orange (Expiring) $\rightarrow$ Flashing Red (Urgent).
5. **Positive Reinforcement:** Focus on "Money Saved" success animations after every scan.
6. **No Feature Creep:** No recipes, social sharing, or multi-step manual forms.

---

## 🏛️ Architectural Invariants
1. **Surface Area Limit:** Maximum of 7 screens (Scanner, Fridge, Graveyard, Analytics, Settings).
2. **Performance First:** Zero-latency local interactions (Dexie.js) before cloud sync.
3. **Atomic Tools:** Tools in `tools/` are atomic and testable.
4. **Secrets Management:** Secrets/keys go in `.env` (never committed).

---

## 🔧 Maintenance Log
| Date | Change | Reason |
|------|--------|--------|
| 2026-05-10 | Project initialized | Protocol 0 |
| 2026-05-11 | Synchronized constitution | Aligned 3-layer architecture |
| 2026-05-12 | Lean Pivot | Refocused on 30s Core Loop and Scanner-first UI |


# Agent Instructions

> This file is mirrored across CLAUDE.md, AGENTS.md, and GEMINI.md so the same instructions load in any AI environment.

You operate within a 3-layer architecture that separates concerns to maximize reliability. LLMs are probabilistic, whereas most business logic is deterministic and requires consistency. This system fixes that mismatch.

## The 3-Layer Architecture

**Layer 1: Directive (What to do)**
- Basically just SOPs written in Markdown, live in `architecture/`
- Define the goals, inputs, tools/scripts to use, outputs, and edge cases
- Natural language instructions, like you'd give a mid-level employee

**Layer 2: Orchestration (Decision making)**
- This is you. Your job: intelligent routing.
- Read directives, call execution tools in the right order, handle errors, ask for clarification, update directives with learnings
- You're the glue between intent and execution. E.g you don't try guessing product data yourself—you read `architecture/barcode_scanning.md` and come up with inputs/outputs and then run `tools/test_open_food_facts.py`

**Layer 3: Execution (Doing the work)**
- Deterministic Python scripts in `tools/`
- Environment variables, api tokens, etc are stored in `.env`
- Handle API calls, data processing, file operations, database interactions
- Reliable, testable, fast. Use scripts instead of manual work. Commented well.

**Why this works:** if you do everything yourself, errors compound. 90% accuracy per step = 59% success over 5 steps. The solution is push complexity into deterministic code. That way you just focus on decision-making.

## Operating Principles

**1. Check for tools first**
Before writing a script, check `tools/` per your directive. Only create new scripts if none exist.

**2. Self-anneal when things break**
- Read error message and stack trace
- Fix the script and test it again (unless it uses paid tokens/credits/etc—in which case you check w user first)
- Update the directive with what you learned (API limits, timing, edge cases)
- Example: you hit an API rate limit → you then look into API → find a batch endpoint that would fix → rewrite script to accommodate → test → update directive.

**3. Update directives as you learn**
Directives are living documents. When you discover API constraints, better approaches, common errors, or timing expectations—update the directive. But don't create or overwrite directives without asking unless explicitly told to. Directives are your instruction set and must be preserved (and improved upon over time, not extemporaneously used and then discarded).

## Self-annealing loop

Errors are learning opportunities. When something breaks:
1. Fix it
2. Update the tool
3. Test tool, make sure it works
4. Update directive to include new flow
5. System is now stronger

## File Organization

**Deliverables vs Intermediates:**
- **Deliverables**: Supabase Database, PWA Interface, or other user-facing features
- **Intermediates**: Temporary files needed during processing

**Directory structure:**
- `.tmp/` - All intermediate files (scraped data, temp exports). Never commit, always regenerated.
- `tools/` - Python scripts (the deterministic tools)
- `architecture/` - SOPs in Markdown (the instruction set)
- `.env` - Environment variables and API keys
- `credentials.json`, `token.json` - Google OAuth credentials (required files, in `.gitignore`)

**Key principle:** Local files are only for processing. Deliverables live in the database or UI where the user can access them. Everything in `.tmp/` can be deleted and regenerated.
 
## Summary

You sit between human intent (directives) and deterministic execution (Python scripts). Read instructions, make decisions, call tools, handle errors, continuously improve the system.

Be pragmatic. Be reliable. Self-anneal.
