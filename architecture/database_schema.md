# Database Schema — Expiry Guard

> Last updated: 2026-05-10

## Tables

### `profiles`
| Column       | Type          | Default   | Notes                          |
|-------------|---------------|-----------|--------------------------------|
| id          | UUID (PK)     | —         | References `auth.users(id)`    |
| full_name   | TEXT          | NULL      |                                |
| avatar_url  | TEXT          | NULL      |                                |
| created_at  | TIMESTAMPTZ   | now()     |                                |
| updated_at  | TIMESTAMPTZ   | now()     | Auto-updated via trigger       |

### `items`
| Column            | Type          | Default        | Notes                                 |
|-------------------|---------------|----------------|---------------------------------------|
| id                | UUID (PK)     | gen_random_uuid| Auto-generated                        |
| user_id           | UUID (FK)     | —              | References `auth.users(id)` CASCADE   |
| name              | TEXT          | —              | Required                              |
| category          | TEXT          | 'food'         | CHECK: food, medication, household    |
| quantity_amount   | NUMERIC       | 1              |                                       |
| quantity_unit     | TEXT          | 'piece'        |                                       |
| storage_location  | TEXT          | 'pantry'       | CHECK: fridge, freezer, pantry, cabinet|
| added_at          | TIMESTAMPTZ   | now()          |                                       |
| expires_at        | TIMESTAMPTZ   | NULL           |                                       |
| consumed_at       | TIMESTAMPTZ   | NULL           |                                       |
| status            | TEXT          | 'active'       | CHECK: active, expiring_soon, expired, consumed, discarded |
| financial_value   | NUMERIC       | NULL           |                                       |
| barcode           | TEXT          | NULL           |                                       |
| notes             | TEXT          | NULL           |                                       |
| created_at        | TIMESTAMPTZ   | now()          |                                       |
| updated_at        | TIMESTAMPTZ   | now()          | Auto-updated via trigger              |

## RLS Policies

All tables have RLS **enabled**. Policies use `(SELECT auth.uid()) = user_id` (or `= id` for profiles).

- `profiles`: SELECT, INSERT, UPDATE — own row only
- `items`: SELECT, INSERT, UPDATE, DELETE — own rows only

## Triggers

1. **`on_auth_user_created`** — After INSERT on `auth.users`, creates a profile row.
2. **`on_profiles_updated`** — Before UPDATE on `profiles`, sets `updated_at = now()`.
3. **`on_items_updated`** — Before UPDATE on `items`, sets `updated_at = now()`.

## Indexes

- `idx_items_user_id` — `items(user_id)`
- `idx_items_status` — `items(status)`
- `idx_items_expires_at` — `items(expires_at)`
- `idx_items_user_status` — `items(user_id, status)` (composite)
