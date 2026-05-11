# Local-First Strategy — Expiry Guard

> Last updated: 2026-05-10

## Overview

Expiry Guard follows a **local-first** architecture per `gemini.md` Behavioral Rule #4:

> "All read/write operations execute against a local database first for zero-latency, syncing to the cloud asynchronously."

## Technology

- **Local Database**: Dexie.js (IndexedDB wrapper)
- **Cloud Database**: Supabase (PostgreSQL)

## Schema Mirroring

The Dexie database (`src/lib/db.ts`) mirrors the Supabase `items` table structure exactly, using the same field names and indexes.

### Indexed Fields (Dexie)
```
items: 'id, user_id, status, expires_at, category, storage_location, [user_id+status]'
```

## Sync Strategy (Future Implementation)

### Phase 1 (Current): Cloud-Only
- Reads and writes go directly to Supabase
- Dexie schema is defined but not yet actively used

### Phase 2: Read Cache
- On login, fetch all user items from Supabase → cache in Dexie
- Reads served from Dexie (instant)
- Writes go to Supabase, then update Dexie on success

### Phase 3: Full Offline
- Writes go to Dexie first with a `pending_sync` flag
- Background sync pushes pending changes to Supabase
- Conflict resolution: last-write-wins based on `updated_at`

## Key Principles

1. **UI reads from local** — zero latency for the user
2. **Writes are optimistic** — show success immediately, sync in background
3. **Sync failures are retried** — queue-based with exponential backoff
4. **Conflicts use timestamps** — `updated_at` determines the winner
