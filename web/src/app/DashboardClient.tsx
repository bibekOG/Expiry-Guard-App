'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Plus,
  Inbox,
  History,
  Scan,
  FileText,
  Flame,
  Pill,
  Sparkles,
  Zap,
  Activity,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import AppLayout from './components/AppLayout'
import StatsCard from './components/StatsCard'
import InventoryChart from './components/InventoryChart'
import ItemCard from './components/ItemCard'
import VoiceInput from './components/VoiceInput'
import AIChatPanel from './components/AIChatPanel'
import SmartInsightsPanel from './components/SmartInsightsPanel'
import { useRealtimeSync } from '@/lib/useRealtimeSync'
import type { Item } from '@/lib/types'

import { getCurrencySymbol } from '@/lib/constants'

interface DashboardClientProps {
  userEmail: string
  items: Item[]
  currency?: string
  location?: string
}

export default function DashboardClient({
  userEmail,
  items,
  currency = 'USD',
  location = '',
}: DashboardClientProps) {
  const router = useRouter()
  const [hasMounted, setHasMounted] = useState(false)

  // Enable real-time sync across devices/household members
  useRealtimeSync()

  useEffect(() => {
    setHasMounted(true)
  }, [])

  // Compute stats
  const activeItems = items.filter((i) => i.status === 'active')
  const expiringSoon = items.filter((i) => i.status === 'expiring_soon')
  const expired = items.filter((i) => i.status === 'expired')
  const consumed = items.filter((i) => i.status === 'consumed')

  const moneySaved = consumed.reduce(
    (sum, item) => sum + (item.financial_value || 0),
    0
  )

  // Show active + expiring items first
  const displayItems = [...expiringSoon, ...expired, ...activeItems].slice(0, 20)
  const historyItems = items.filter((i) => i.status === 'consumed' || i.status === 'discarded').slice(0, 5)

  return (
    <AppLayout userEmail={userEmail} userLocation={location} userCurrency={currency}>
      <div className="grow max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* 🧠 Smart AI Insights — Proactive Alerts */}
        {hasMounted && <SmartInsightsPanel />}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-[var(--text-faint)] mt-1">
              Your inventory at a glance
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/add')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 texttext-white text-sm font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Item
          </motion.button>
        </div>

        {/* Dashboard Sections */}
        <div className="space-y-12 mb-12">
          {/* Stats Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[var(--text-faint)] px-1">
              <Activity className="w-4 h-4" />
              <h2 className="text-xs font-bold uppercase tracking-widest">Inventory Performance</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Total Items"
                value={activeItems.length + expiringSoon.length}
                subtitle="In your inventory"
                icon={Package}
                gradient="from-emerald-500/20 to-teal-500/20"
                delay={0}
                onClick={() => router.push('/inventory')}
              />
              <StatsCard
                title="Expiring Soon"
                value={expiringSoon.length}
                subtitle="Needs attention"
                icon={AlertTriangle}
                gradient="from-amber-500/20 to-orange-500/20"
                delay={0.1}
                onClick={() => router.push('/inventory?filter=expiring')}
              />
              <StatsCard
                title="Money Saved"
                value={`${getCurrencySymbol(currency)}${moneySaved.toFixed(0)}`}
                subtitle="By using items in time"
                icon={DollarSign}
                gradient="from-sky-500/20 to-blue-500/20"
                delay={0.2}
                onClick={() => router.push('/analytics/savings')}
              />
              <StatsCard
                title="Usage Rate"
                value={
                  items.length > 0
                    ? `${Math.round(
                        (consumed.length / items.length) * 100
                      )}%`
                    : '—'
                }
                subtitle="Items consumed vs total"
                icon={TrendingUp}
                gradient="from-violet-500/20 to-purple-500/20"
                delay={0.3}
                onClick={() => router.push('/analytics/usage')}
              />
            </div>
          </div>

          {/* Smart Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* AI Input Tools */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[var(--text-faint)] px-1">
                <Zap className="w-4 h-4" />
                <h2 className="text-xs font-bold uppercase tracking-widest">Intelligent Entry</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/scan')}
                  className="p-4 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-sm shadow-[var(--shadow-color)] hover:bg-[var(--glass-hover)] hover:border-emerald-500/30 hover:shadow-md transition-all flex flex-col items-center gap-2 group"
                >
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:texttext-white transition-colors">
                    <Scan className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[var(--text-muted)] group-hover:text-foreground uppercase tracking-wider">Barcode</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/receipt')}
                  className="p-4 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-sm shadow-[var(--shadow-color)] hover:bg-[var(--glass-hover)] hover:border-sky-500/30 hover:shadow-md transition-all flex flex-col items-center gap-2 group"
                >
                  <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500 group-hover:bg-sky-500 group-hover:texttext-white transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[var(--text-muted)] group-hover:text-foreground uppercase tracking-wider">OCR Receipt</span>
                </motion.button>
              </div>
            </div>

            {/* Smart Management */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[var(--text-faint)] px-1">
                <Sparkles className="w-4 h-4" />
                <h2 className="text-xs font-bold uppercase tracking-widest">Discovery & Care</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/recipes')}
                  className="p-4 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-sm shadow-[var(--shadow-color)] hover:bg-[var(--glass-hover)] hover:border-orange-500/30 hover:shadow-md transition-all flex flex-col items-center gap-2 group"
                >
                  <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500 group-hover:bg-orange-500 group-hover:texttext-white transition-colors">
                    <Flame className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[var(--text-muted)] group-hover:text-foreground uppercase tracking-wider">Recipes</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/medications')}
                  className="p-4 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-sm shadow-[var(--shadow-color)] hover:bg-[var(--glass-hover)] hover:border-rose-500/30 hover:shadow-md transition-all flex flex-col items-center gap-2 group"
                >
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 group-hover:bg-rose-500 group-hover:texttext-white transition-colors">
                    <Pill className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[var(--text-muted)] group-hover:text-foreground uppercase tracking-wider">Meds</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Visualization */}
        <InventoryChart items={items} />

        {/* Items Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Recent Items
            </h2>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/analytics')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] text-foreground text-sm font-medium hover:bg-[var(--glass-bg)] transition-all"
              >
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="hidden sm:inline">Analytics</span>
              </motion.button>
            </div>
          </div>

          {displayItems.length > 0 ? (
            <motion.div layout className="space-y-2">
              <AnimatePresence mode="popLayout">
                {displayItems.map((item, index) => (
                  <ItemCard key={item.id} item={item} index={index} currency={currency} />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(255,255,255,0.02)]"
              >
                <Inbox className="w-8 h-8 text-[var(--text-faint)]" />
              </motion.div>
              <h3 className="text-lg font-semibold text-[var(--text-muted)] mb-1">
                No items yet
              </h3>
              <p className="text-sm text-[var(--text-faint)] max-w-xs">
                Start by adding your first item to track its expiry date
                and save money.
              </p>
            </motion.div>
          )}
        </div>

        {/* History Section */}
        {historyItems.length > 0 && (
          <div className="space-y-4 mt-10">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[var(--text-faint)]" />
              <h2 className="text-lg font-semibold text-[var(--text-muted)]">
                History
              </h2>
            </div>
            <motion.div layout className="space-y-2 opacity-60">
              <AnimatePresence mode="popLayout">
                {historyItems.map((item, index) => (
                  <ItemCard key={item.id} item={item} index={index} currency={currency} />
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </div>

      {/* Floating Features */}
      {hasMounted && (
        <>
          <VoiceInput onItemsParsed={() => {
            router.refresh()
          }} />
          <AIChatPanel />
        </>
      )}

      {/* Footer */}
      <footer className="border-t border-[var(--glass-border)] py-6 mt-auto">
        <p className="text-center text-xs text-[var(--text-faint)]">
          Expiry Guard — Track your food. Reduce waste. Save money.
        </p>
      </footer>
    </AppLayout>
  )
}
