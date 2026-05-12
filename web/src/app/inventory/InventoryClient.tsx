'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  Search, 
  Archive,
  Thermometer,
  Zap,
  LayoutDashboard
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import AppLayout from '../components/AppLayout'
import ItemCard from '../components/ItemCard'
import type { Item } from '@/lib/types'

interface InventoryClientProps {
  userEmail: string
  items: Item[]
  currency?: string
  location?: string
}

export default function InventoryClient({
  userEmail,
  items,
  currency = 'USD',
  location = '',
}: InventoryClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  // Filter items to only show active ones in the Fridge
  const activeItems = useMemo(() => {
    return items
      .filter(item => 
        (item.status === 'active' || item.status === 'expiring_soon' || item.status === 'expired') &&
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        // Sort by expiry: expired first, then expiring_soon, then active
        const score = { expired: 0, expiring_soon: 1, active: 2 }
        return (score[a.status as keyof typeof score] ?? 3) - (score[b.status as keyof typeof score] ?? 3)
      })
  }, [items, searchQuery])

  const expiringCount = items.filter(i => i.status === 'expiring_soon' || i.status === 'expired').length

  return (
    <AppLayout userEmail={userEmail} userLocation={location} userCurrency={currency}>
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {/* The Fridge Header */}
        <div className="flex flex-col gap-6 mb-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <LayoutDashboard className="w-6 h-6 text-emerald-500" />
               </div>
               <div>
                  <h1 className="text-3xl font-black text-foreground tracking-tight">The Fridge</h1>
                  <p className="text-sm text-[var(--text-faint)] font-medium">{activeItems.length} items chilling</p>
               </div>
            </div>
            {expiringCount > 0 && (
               <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-black uppercase tracking-widest animate-pulse">
                  <Zap className="w-3.5 h-3.5" />
                  <span>{expiringCount} Critical</span>
               </div>
            )}
          </div>

          {/* Minimal Search */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)] group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Search fridge..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/20 rounded-2xl py-4 pl-12 pr-4 text-sm text-foreground placeholder:text-[var(--text-faint)] outline-none transition-all"
            />
          </div>
        </div>

        {/* Fridge Items */}
        <div className="space-y-6">
          {activeItems.length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {activeItems.map((item, index) => (
                  <ItemCard 
                    key={item.id} 
                    item={item} 
                    index={index} 
                    currency={currency}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center opacity-40">
              <Thermometer className="w-16 h-16 text-[var(--text-faint)] mb-4" />
              <h3 className="text-xl font-bold text-foreground">Fridge is empty</h3>
              <p className="text-sm text-[var(--text-faint)] max-w-xs mt-2">Go shop and scan some items to fill it up!</p>
              <button 
                onClick={() => router.push('/')}
                className="mt-8 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold text-sm"
              >
                Scan Now
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
