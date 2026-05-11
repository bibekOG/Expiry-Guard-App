'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  Package, 
  Filter, 
  Search, 
  LayoutGrid, 
  List,
  Utensils,
  Pill,
  Home,
  Archive,
  ArrowUpDown
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import AppLayout from '../components/AppLayout'
import ItemCard from '../components/ItemCard'
import type { Item } from '@/lib/types'

interface InventoryClientProps {
  userEmail: string
  items: Item[]
  currency?: string
  location?: string
}

const CATEGORY_ICONS: Record<string, any> = {
  food: Utensils,
  medication: Pill,
  household: Home,
}

const CATEGORY_COLORS: Record<string, string> = {
  food: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  medication: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
  household: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
  other: 'text-[var(--text-faint)] bg-[var(--glass-bg)] border-[var(--glass-border)]',
}

export default function InventoryClient({
  userEmail,
  items,
  currency = 'USD',
  location = '',
}: InventoryClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filterParam = searchParams.get('filter')
  
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [activeCategory, setActiveCategory] = useState<string | 'all'>('all')

  // Group and filter items
  const filteredItems = useMemo(() => {
    let result = items.filter(item => 
      (item.status === 'active' || item.status === 'expiring_soon') &&
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (filterParam === 'expiring') {
      result = result.filter(item => item.status === 'expiring_soon')
    }

    if (activeCategory !== 'all') {
      result = result.filter(item => item.category === activeCategory)
    }

    return result
  }, [items, searchQuery, filterParam, activeCategory])

  const groupedItems = useMemo(() => {
    const groups: Record<string, Item[]> = {}
    
    filteredItems.forEach(item => {
      const cat = item.category || 'other'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(item)
    })
    
    return groups
  }, [filteredItems])

  const categories = ['all', ...Array.from(new Set(items.map(i => i.category).filter(Boolean)))]

  return (
    <AppLayout userEmail={userEmail} userLocation={location} userCurrency={currency}>
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => router.push('/')}
              className="p-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-muted)] hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                {filterParam === 'expiring' ? 'Expiring Soon' : 'Inventory'}
              </h1>
              <p className="text-sm text-[var(--text-faint)] mt-1">
                {filteredItems.length} active items found
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)] group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="text"
                placeholder="Search your inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/20 rounded-2xl py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-[var(--text-faint)] outline-none transition-all"
              />
            </div>
            
            <div className="flex gap-2">
              <div className="flex p-1 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[var(--glass-bg)] text-foreground shadow-lg' : 'text-[var(--text-faint)] hover:text-[var(--text-muted)]'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[var(--glass-bg)] text-foreground shadow-lg' : 'text-[var(--text-faint)] hover:text-[var(--text-muted)]'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-muted)] hover:text-foreground text-sm font-medium transition-all"
              >
                <ArrowUpDown className="w-4 h-4" />
                <span className="hidden sm:inline">Sort</span>
              </motion.button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-emerald-500 texttext-white border-emerald-400 shadow-lg shadow-emerald-500/20'
                    : 'bg-[var(--glass-bg)] text-[var(--text-faint)] border-[var(--glass-border)] hover:bg-[var(--glass-bg)] hover:text-[var(--text-muted)]'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Grouped Content */}
        <div className="space-y-12">
          {Object.entries(groupedItems).length > 0 ? (
            Object.entries(groupedItems).map(([category, catItems]) => {
              const Icon = CATEGORY_ICONS[category] || Archive
              const colorClass = CATEGORY_COLORS[category] || CATEGORY_COLORS.other
              
              return (
                <section key={category} className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg border ${colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h2 className="text-lg font-bold text-foreground capitalize tracking-tight">
                      {category}
                      <span className="ml-2 text-xs font-normal text-[var(--text-faint)]">
                        {catItems.length} {catItems.length === 1 ? 'item' : 'items'}
                      </span>
                    </h2>
                  </div>
                  
                  <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}>
                    <AnimatePresence mode="popLayout">
                      {catItems.map((item, index) => (
                        <ItemCard 
                          key={item.id} 
                          item={item} 
                          index={index} 
                          currency={currency}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              )
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center mb-4">
                <Archive className="w-8 h-8 text-foreground/10" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-muted)]">No items match your filters</h3>
              <p className="text-sm text-[var(--text-faint)] max-w-xs mt-1">Try adjusting your search query or filters.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
