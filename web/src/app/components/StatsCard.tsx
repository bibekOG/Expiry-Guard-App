'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  gradient: string
  delay?: number
  onClick?: () => void
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  delay = 0,
  onClick,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`relative group ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="backdrop-blur-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-5 shadow-lg shadow-[var(--shadow-color)] hover:border-[var(--glass-border)] transition-all duration-300">
        {/* Subtle gradient glow on hover */}
        <div
          className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${gradient} blur-xl -z-10`}
        />

        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
              {title}
            </p>
            <motion.p 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: delay + 0.2, type: 'spring', stiffness: 100 }}
              className="text-3xl font-bold text-foreground tracking-tight"
            >
              {value}
            </motion.p>
            {subtitle && (
              <p className="text-xs text-[var(--text-faint)]">{subtitle}</p>
            )}
          </div>
          <motion.div
            whileHover={{ rotate: 10 }}
            className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} shadow-lg shadow-[var(--shadow-color)] border border-[var(--glass-border)]`}
          >
            <Icon className="w-5 h-5 text-foreground" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
