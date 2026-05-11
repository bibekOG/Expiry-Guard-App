'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ChefHat,
  Clock,
  ExternalLink,
  Loader2,
  UtensilsCrossed,
  Flame,
} from 'lucide-react'
import { findRecipes } from '@/lib/recipes'
import type { Recipe, Item } from '@/lib/types'

export default function RecipesPage() {
  const router = useRouter()
  const [expiringItems, setExpiringItems] = useState<Item[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

  useEffect(() => {
    loadExpiringItemsAndRecipes()
  }, [])

  async function loadExpiringItemsAndRecipes() {
    setIsLoading(true)
    try {
      // Fetch items from the dashboard API (reuse server data)
      const res = await fetch('/api/expiring-items')
      const data = await res.json()

      if (data.items && data.items.length > 0) {
        setExpiringItems(data.items)
        // Get ingredient names for recipe search
        const ingredientNames = data.items.map((item: Item) => item.name)
        const foundRecipes = await findRecipes(ingredientNames)
        setRecipes(foundRecipes)
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-[var(--glass-border)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16 gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 -ml-2 rounded-xl text-[var(--text-muted)] hover:text-foreground hover:bg-[var(--glass-bg)] transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Eat This Now
              </h1>
              <p className="text-xs text-[var(--text-faint)]">
                Recipes using items expiring soon
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Expiring Items Banner */}
        {expiringItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <h2 className="text-sm font-semibold text-orange-500">
                Use These Soon
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {expiringItems.map((item) => (
                <span
                  key={item.id}
                  className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs text-orange-300"
                >
                  {item.name}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-4" />
            <p className="text-sm text-[var(--text-faint)]">
              Finding recipes for your expiring items...
            </p>
          </div>
        ) : recipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center mb-4">
              <ChefHat className="w-8 h-8 text-[var(--text-faint)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-muted)] mb-1">
              No recipes found
            </h3>
            <p className="text-sm text-[var(--text-faint)] max-w-xs text-center">
              {expiringItems.length === 0
                ? 'No items are expiring soon. Great job managing your inventory!'
                : 'We couldn\'t find recipes matching your expiring items.'}
            </p>
          </div>
        ) : (
          /* Recipe Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recipes.map((recipe, index) => (
              <motion.div
                key={recipe.idMeal}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedRecipe(recipe)}
                className="group cursor-pointer rounded-2xl overflow-hidden border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-orange-500/30 hover:bg-[var(--glass-bg)] transition-all duration-300"
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={recipe.strMealThumb}
                    alt={recipe.strMeal}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-orange-500 transition-colors">
                    {recipe.strMeal}
                  </h3>
                  {recipe.strCategory && (
                    <span className="text-xs text-[var(--text-faint)]">
                      {recipe.strCategory}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Recipe Detail Modal */}
        {selectedRecipe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/70 backdrop-blur-sm"
            onClick={() => setSelectedRecipe(null)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[80vh] overflow-y-auto bg-card-bg border border-[var(--glass-border)] rounded-3xl p-6"
            >
              <img
                src={selectedRecipe.strMealThumb}
                alt={selectedRecipe.strMeal}
                className="w-full h-48 object-cover rounded-2xl mb-4"
              />
              <h2 className="text-xl font-bold text-foreground mb-2">
                {selectedRecipe.strMeal}
              </h2>
              {selectedRecipe.strInstructions && (
                <p className="text-sm text-[var(--text-muted)] whitespace-pre-line mb-4">
                  {selectedRecipe.strInstructions}
                </p>
              )}
              <div className="flex gap-3">
                {selectedRecipe.strSource && (
                  <a
                    href={selectedRecipe.strSource}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl text-sm text-orange-500"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Full Recipe
                  </a>
                )}
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--text-muted)]"
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
