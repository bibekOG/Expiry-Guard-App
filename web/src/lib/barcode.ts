// =============================================
// Expiry Guard — Barcode Lookup Utility
// Calls Open Food Facts API to resolve barcodes
// =============================================

import type { ItemCategory } from './types'

export interface BarcodeResult {
  name: string
  category: ItemCategory
  image_url: string | null
  barcode: string
  brands: string | null
}

/**
 * Map Open Food Facts category strings to our app categories.
 * Returns 'food' for anything food-related, or falls back.
 */
function mapCategory(offCategories: string): ItemCategory {
  const lower = offCategories.toLowerCase()
  if (
    lower.includes('medicine') ||
    lower.includes('pharma') ||
    lower.includes('health')
  ) {
    return 'medication'
  }
  if (
    lower.includes('cleaning') ||
    lower.includes('household') ||
    lower.includes('laundry')
  ) {
    return 'household'
  }
  return 'food'
}

/**
 * Look up a barcode via our server-side API route (proxies Open Food Facts).
 */
export async function lookupBarcode(
  barcode: string
): Promise<BarcodeResult | null> {
  try {
    const res = await fetch(`/api/barcode?code=${encodeURIComponent(barcode)}`)
    if (!res.ok) return null

    const data = await res.json()
    if (!data.success) return null

    return {
      name: data.name,
      category: mapCategory(data.categories || ''),
      image_url: data.image_url || null,
      barcode,
      brands: data.brands || null,
    }
  } catch {
    return null
  }
}
