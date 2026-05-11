'use client'

import { motion } from 'framer-motion'
import { Clock, Trash2, CheckCircle, AlertTriangle, UtensilsCrossed, MoreHorizontal, X } from 'lucide-react'
import { useState, useTransition } from 'react'
import { updateItemStatus, deleteItem } from '@/app/actions'
import type { Item } from '@/lib/types'

const statusConfig = {
  active: {
    color: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20',
    icon: CheckCircle,
    label: 'Active',
  },
  expiring_soon: {
    color: 'bg-amber-500/15 text-amber-500 border-amber-500/20',
    icon: AlertTriangle,
    label: 'Expiring Soon',
  },
  expired: {
    color: 'bg-red-500/15 text-red-500 border-red-500/20',
    icon: AlertTriangle,
    label: 'Expired',
  },
  consumed: {
    color: 'bg-sky-500/15 text-sky-500 border-sky-500/20',
    icon: CheckCircle,
    label: 'Consumed',
  },
  discarded: {
    color: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',
    icon: Trash2,
    label: 'Discarded',
  },
}

const categoryEmoji: Record<string, string> = {
  food: '🍎',
  medication: '💊',
  household: '🏠',
}

function getDaysUntilExpiry(expiresAt: string | null): string {
  if (!expiresAt) return 'No expiry set'
  const now = new Date()
  const expiry = new Date(expiresAt)
  const diffMs = expiry.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return `Expired ${Math.abs(diffDays)}d ago`
  if (diffDays === 0) return 'Expires today'
  if (diffDays === 1) return 'Expires tomorrow'
  return `${diffDays} days left`
}

function getExpiryProgress(addedAt: string, expiresAt: string | null): number {
  if (!expiresAt) return 100
  const added = new Date(addedAt).getTime()
  const expiry = new Date(expiresAt).getTime()
  const now = new Date().getTime()
  
  const total = expiry - added
  if (total <= 0) return 0
  
  const remaining = expiry - now
  if (remaining <= 0) return 0
  
  return Math.min(100, (remaining / total) * 100)
}

interface ItemCardProps {
  item: Item
  index?: number
}

export default function ItemCard({ item, index = 0 }: ItemCardProps) {
  const [showActions, setShowActions] = useState(false)
  const [isPending, startTransition] = useTransition()
  const status = statusConfig[item.status]
  const StatusIcon = status.icon

  const handleAction = (action: 'consumed' | 'discarded' | 'delete') => {
    setShowActions(false)
    startTransition(async () => {
      if (action === 'delete') {
        await deleteItem(item.id)
      } else {
        await updateItemStatus(item.id, action)
      }
    })
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: isPending ? 0.4 : 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, x: -20, transition: { duration: 0.2 } }}
      transition={{ delay: index * 0.05, duration: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
      whileHover={{ scale: 1.01 }}
      className="relative backdrop-blur-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl p-4 hover:bg-[var(--glass-bg)] hover:border-[var(--glass-border)] hover:shadow-lg transition-all duration-300 group overflow-hidden"
    >
      {/* Hover glow effect behind item */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent viatext-white/[0.02] to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      
      <div className="relative flex items-center gap-4">
        {/* Category emoji */}
        <div className="w-10 h-10 rounded-xl bg-[var(--glass-bg)] flex items-center justify-center text-lg shrink-0">
          {categoryEmoji[item.category] || '📦'}
        </div>

        {/* Item info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {item.name}
            </h3>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${status.color}`}
            >
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-[var(--text-faint)]">
              {item.quantity_amount} {item.quantity_unit}
            </span>
            <span className="text-xs text-[var(--text-faint)]">•</span>
            <span className="text-xs text-[var(--text-faint)] capitalize">
              {item.storage_location}
            </span>
            {item.financial_value && (
              <>
                <span className="text-xs text-[var(--text-faint)]">•</span>
                <span className="text-xs text-emerald-500/60">
                  ${item.financial_value}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Expiry countdown */}
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-faint)] shrink-0 mr-2">
          <Clock className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{getDaysUntilExpiry(item.expires_at)}</span>
        </div>

        {/* Action menu button */}
        {(item.status === 'active' || item.status === 'expiring_soon' || item.status === 'expired') && (
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Action Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAction('consumed')}
              disabled={isPending}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-500/20 transition-all disabled:opacity-50"
            >
              {item.category === 'food' ? (
                <>
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>Eaten</span>
                </>
              ) : item.category === 'medication' ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Taken</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Used</span>
                </>
              )}
            </motion.button>

            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1.5 rounded-lg text-[var(--text-faint)] hover:text-foreground hover:bg-[var(--glass-bg)] transition-all"
            >
              {showActions ? <X className="w-4 h-4" /> : <MoreHorizontal className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      {/* Expiry Progress Bar */}
      {item.expires_at && (item.status === 'active' || item.status === 'expiring_soon' || item.status === 'expired') && (
        <div className="mt-3.5 h-1 w-full bg-[var(--glass-bg)] rounded-full overflow-hidden border border-[var(--glass-border)]">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${getExpiryProgress(item.added_at, item.expires_at)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full ${
              item.status === 'expired' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 
              item.status === 'expiring_soon' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 
              'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
            }`} 
          />
        </div>
      )}

      {/* Action buttons */}
      {showActions && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative flex gap-2 mt-3 pt-3 border-t border-[var(--glass-border)] overflow-hidden"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAction('consumed')}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
          >
            {item.category === 'food' ? (
              <>
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>Eaten</span>
              </>
            ) : item.category === 'medication' ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Taken</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Used</span>
              </>
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAction('discarded')}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-medium hover:bg-amber-500/20 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Discarded
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleAction('delete')}
            disabled={isPending}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
          >
            <X className="w-3.5 h-3.5" />
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  )
}
