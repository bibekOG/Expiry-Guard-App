// =============================================
// Expiry Guard — Shelf Life Estimation Utility
// Uses local shelf_life_defaults table for known items,
// falls back to a fuzzy match approach.
// =============================================

import type { StorageLocation } from './types'

interface ShelfLifeEntry {
  name: string
  storage_location: string
  shelf_life_days: number
}

/**
 * Estimate expiry date for an item based on its name and storage location.
 * First tries an exact match, then a fuzzy (substring) match against
 * the shelf_life_defaults data.
 *
 * @param itemName - The name of the item
 * @param storageLocation - Where the item is stored
 * @param defaults - Array of shelf life defaults (fetched from Supabase or Dexie)
 * @returns Estimated expiry date as ISO string, or null if no match found
 */
export function estimateExpiry(
  itemName: string,
  storageLocation: StorageLocation,
  defaults: ShelfLifeEntry[]
): string | null {
  const nameLower = itemName.toLowerCase().trim()

  // 1. Try exact match on name + storage location
  const exactMatch = defaults.find(
    (d) =>
      d.name.toLowerCase() === nameLower &&
      d.storage_location === storageLocation
  )
  if (exactMatch) {
    return addDays(exactMatch.shelf_life_days)
  }

  // 2. Try substring match on name + storage location
  const substringMatch = defaults.find(
    (d) =>
      (nameLower.includes(d.name.toLowerCase()) ||
        d.name.toLowerCase().includes(nameLower)) &&
      d.storage_location === storageLocation
  )
  if (substringMatch) {
    return addDays(substringMatch.shelf_life_days)
  }

  // 3. Try exact match ignoring storage location
  const anyLocationMatch = defaults.find(
    (d) => d.name.toLowerCase() === nameLower
  )
  if (anyLocationMatch) {
    return addDays(anyLocationMatch.shelf_life_days)
  }

  // 4. No match found
  return null
}

function addDays(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString()
}
