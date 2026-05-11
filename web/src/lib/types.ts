// =============================================
// Expiry Guard — Shared TypeScript Types
// Matches gemini.md Output Shape + Feature Roadmap extensions
// =============================================

export type ItemCategory = 'food' | 'medication' | 'household'

export type StorageLocation = 'fridge' | 'freezer' | 'pantry' | 'cabinet'

export type ItemStatus =
  | 'active'
  | 'expiring_soon'
  | 'expired'
  | 'consumed'
  | 'discarded'

export type InputSource = 'barcode' | 'ocr' | 'voice' | 'manual'

export type HouseholdRole = 'owner' | 'member'

export type UsageAction = 'consumed' | 'discarded'

export interface Item {
  id: string
  user_id: string
  household_id: string | null
  name: string
  category: ItemCategory
  quantity_amount: number
  quantity_unit: string
  storage_location: StorageLocation
  added_at: string
  expires_at: string | null
  consumed_at: string | null
  status: ItemStatus
  financial_value: number | null
  barcode: string | null
  notes: string | null
  source: InputSource
  image_url: string | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  default_household_id: string | null
  created_at: string
  updated_at: string
}

export interface Household {
  id: string
  name: string
  owner_id: string
  invite_code: string
  created_at: string
}

export interface HouseholdMember {
  household_id: string
  user_id: string
  role: HouseholdRole
  joined_at: string
}

export interface ShelfLifeDefault {
  id: string
  name: string
  category: ItemCategory
  storage_location: StorageLocation
  shelf_life_days: number
  source: string
  created_at: string
}

export interface UsageLog {
  id: string
  user_id: string
  item_name: string
  action: UsageAction
  action_date: string
  day_of_week: number
  category: string | null
  financial_value: number | null
}

// Input shape for adding items (matches gemini.md Input Shape)
export interface ItemInput {
  name: string
  category: ItemCategory
  quantity_amount: number
  quantity_unit: string
  storage_location: StorageLocation
  expires_at?: string
  financial_value?: number
  barcode?: string
  notes?: string
  source?: InputSource
  image_url?: string
  household_id?: string
}

// Recipe types (for TheMealDB integration)
export interface Recipe {
  idMeal: string
  strMeal: string
  strMealThumb: string
  strCategory?: string
  strInstructions?: string
  strSource?: string
}
