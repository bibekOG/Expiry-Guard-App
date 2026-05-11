'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, PieChart, Lightbulb } from 'lucide-react'
import type { Item } from '@/lib/types'

interface InventoryChartProps {
  items: Item[]
}

export default function InventoryChart({ items }: InventoryChartProps) {
  // Simple visual representation of status distribution
  const statusCounts = items.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const total = items.length || 1
  const activePercent = Math.round(((statusCounts['active'] || 0) / total) * 100)
  const soonPercent = Math.round(((statusCounts['expiring_soon'] || 0) / total) * 100)
  const expiredPercent = Math.round(((statusCounts['expired'] || 0) / total) * 100)

  // Find the closest expiring food item
  const expiringFoodItems = items
    .filter(i => (i.status === 'active' || i.status === 'expiring_soon') && i.category === 'food' && i.expires_at)
    .sort((a, b) => new Date(a.expires_at!).getTime() - new Date(b.expires_at!).getTime())

  const eatNextItem = expiringFoodItems.length > 0 ? expiringFoodItems[0] : null
  
  const getDaysText = (expiresAt: string) => {
    const diffMs = new Date(expiresAt).getTime() - new Date().getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return 'already expired'
    if (diffDays === 0) return 'expires today'
    if (diffDays === 1) return 'expires tomorrow'
    return `expires in ${diffDays} days`
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="backdrop-blur-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-lg shadow-[var(--shadow-color)] rounded-3xl p-6 mb-10 overflow-hidden relative group"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
            <PieChart className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Health Status</h3>
        </div>
        <TrendingUp className="w-4 h-4 text-[var(--text-faint)] group-hover:text-emerald-500 transition-colors" />
      </div>

      <div className="space-y-4">
        {/* Simple Progress Bar Chart */}
        <div className="h-3 w-full bg-[var(--glass-bg)] rounded-full flex overflow-hidden border border-[var(--glass-border)]">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${activePercent}%` }}
            className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
          />
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${soonPercent}%` }}
            className="h-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" 
          />
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${expiredPercent}%` }}
            className="h-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" 
          />
        </div>

        <div className="grid grid-cols-3 gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-faint)]">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Healthy ({activePercent}%)</span>
          </div>
          <div className="flex items-center gap-1.5 text-center justify-center">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Soon ({soonPercent}%)</span>
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>Waste ({expiredPercent}%)</span>
          </div>
        </div>

        {eatNextItem && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 pt-4 border-t border-[var(--glass-border)] flex items-start gap-3"
          >
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 mt-0.5">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Smart Suggestion</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Consider using <span className="text-emerald-500 font-medium">{eatNextItem.name}</span> next. It {getDaysText(eatNextItem.expires_at!)}.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

