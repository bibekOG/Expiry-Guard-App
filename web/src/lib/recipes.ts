// =============================================
// Expiry Guard — Recipe Lookup Utility
// Uses TheMealDB API to find recipes by ingredient
// =============================================

import type { Recipe } from './types'

const MEALDB_BASE = 'https://www.themealdb.com/api/json/v1/1'

/**
 * Search for recipes that use a given ingredient.
 */
async function searchByIngredient(ingredient: string): Promise<Recipe[]> {
  try {
    const res = await fetch(
      `${MEALDB_BASE}/filter.php?i=${encodeURIComponent(ingredient)}`
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.meals || []) as Recipe[]
  } catch {
    return []
  }
}

/**
 * Get full recipe details by ID.
 */
export async function getRecipeDetails(
  mealId: string
): Promise<Recipe | null> {
  try {
    const res = await fetch(`${MEALDB_BASE}/lookup.php?i=${mealId}`)
    if (!res.ok) return null
    const data = await res.json()
    return data.meals?.[0] || null
  } catch {
    return null
  }
}

/**
 * Find recipes that use any of the given ingredients.
 * Returns deduplicated results, scored by how many provided ingredients they match.
 */
export async function findRecipes(ingredients: string[]): Promise<Recipe[]> {
  // Search for each ingredient in parallel
  const results = await Promise.all(
    ingredients.slice(0, 5).map((ing) => searchByIngredient(ing))
  )

  // Deduplicate by meal ID and count occurrences
  const mealMap = new Map<string, { recipe: Recipe; count: number }>()

  for (const meals of results) {
    for (const meal of meals) {
      const existing = mealMap.get(meal.idMeal)
      if (existing) {
        existing.count++
      } else {
        mealMap.set(meal.idMeal, { recipe: meal, count: 1 })
      }
    }
  }

  // Sort by number of matching ingredients (most matches first)
  return Array.from(mealMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 12)
    .map((entry) => entry.recipe)
}
