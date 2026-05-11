// =============================================
// Expiry Guard — Local-First Database (Dexie.js)
// Mirrors the Supabase tables for offline reads
// =============================================

import Dexie, { type EntityTable } from 'dexie'
import type { Item, ShelfLifeDefault } from './types'

const db = new Dexie('ExpiryGuardDB') as Dexie & {
  items: EntityTable<Item, 'id'>
  shelf_life_defaults: EntityTable<ShelfLifeDefault, 'id'>
}

db.version(2).stores({
  // Indexed fields for fast querying
  items:
    'id, user_id, household_id, status, expires_at, category, storage_location, source, [user_id+status], [household_id+status]',
  shelf_life_defaults:
    'id, name, category, storage_location, [name+storage_location]',
})

export { db }
