'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Skull, 
  Trash2, 
  CheckCircle, 
  TrendingUp,
  History,
  Coins
} from 'lucide-react'
import AppLayout from '../components/AppLayout'
import ItemCard from '../components/ItemCard'
import type { Item } from '@/lib/types'
import { getCurrencySymbol } from '@/lib/constants'

interface GraveyardClientProps {
  userEmail: string
  items: Item[]
  currency?: string
  location?: string
}

export default function GraveyardClient({
  userEmail,
  items,
  currency = 'USD',
  location = '',
}: GraveyardClientProps) {
  
  const stats = useMemo(() => {
    const consumed = items.filter(i => i.status === 'consumed')
    const wasted = items.filter(i => i.status === 'discarded' || i.status === 'expired')
    
    const savedMoney = consumed.reduce((acc, item) => acc + (Number(item.financial_value) || 0), 0)
    const wastedMoney = wasted.reduce((acc, item) => acc + (Number(item.financial_value) || 0), 0)
    
    return {
      savedMoney,
      wastedMoney,
      consumedCount: consumed.length,
      wastedCount: wasted.length,
      totalCount: items.length
    }
  }, [items])

  return (
    <AppLayout userEmail={userEmail} userLocation={location} userCurrency={currency}>
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {/* Graveyard Header */}
        <div className="flex flex-col gap-6 mb-10">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-zinc-500/10 flex items-center justify-center border border-zinc-500/20">
                <History className="w-6 h-6 text-[var(--text-muted)]" />
             </div>
             <div>
                <h1 className="text-3xl font-black text-foreground tracking-tight">The Graveyard</h1>
                <p className="text-sm text-[var(--text-faint)] font-medium">History of your items</p>
             </div>
          </div>

          {/* Impact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex flex-col gap-1"
            >
              <div className="flex items-center gap-2 text-emerald-500 mb-1">
                <Coins className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Money Saved</span>
              </div>
              <div className="text-3xl font-black text-foreground">
                {getCurrencySymbol(currency)}{stats.savedMoney.toFixed(2)}
              </div>
              <p className="text-xs text-[var(--text-faint)] font-medium">From {stats.consumedCount} consumed items</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-3xl bg-red-500/5 border border-red-500/10 flex flex-col gap-1"
            >
              <div className="flex items-center gap-2 text-red-500 mb-1">
                <Trash2 className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Money Wasted</span>
              </div>
              <div className="text-3xl font-black text-foreground">
                {getCurrencySymbol(currency)}{stats.wastedMoney.toFixed(2)}
              </div>
              <p className="text-xs text-[var(--text-faint)] font-medium">From {stats.wastedCount} lost items</p>
            </motion.div>
          </div>
        </div>

        {/* History List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
             <h2 className="text-xs font-black text-[var(--text-faint)] uppercase tracking-[0.2em]">Recent Activity</h2>
          </div>

          {items.length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {items.map((item, index) => (
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
              <Skull className="w-16 h-16 text-[var(--text-faint)] mb-4" />
              <h3 className="text-xl font-bold text-foreground">No history yet</h3>
              <p className="text-sm text-[var(--text-faint)] max-w-xs mt-2">When you eat or discard items, they'll appear here.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
