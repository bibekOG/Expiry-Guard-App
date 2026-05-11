'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ChefHat, Clock, AlertTriangle, Loader2, ChevronRight, RefreshCw, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ProactiveInsight {
  type: 'expiry_warning' | 'meal_suggestion' | 'pattern' | 'tip'
  title: string
  body: string
  urgency: 'high' | 'medium' | 'low'
  items?: string[]
}

export default function SmartInsightsPanel() {
  const router = useRouter()
  const [insights, setInsights] = useState<ProactiveInsight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dismissed, setDismissed] = useState<number[]>([])

  useEffect(() => {
    fetchInsights()
  }, [])

  async function fetchInsights() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/smart-insights')
      const data = await res.json()
      if (data.success) {
        setInsights(data.insights)
      }
    } catch {
      // silent fail
    } finally {
      setIsLoading(false)
    }
  }

  const visibleInsights = insights.filter((_, i) => !dismissed.includes(i))

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-8 p-6 rounded-3xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/10"
      >
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
          <span className="text-sm text-[var(--text-faint)]">Guard AI is analyzing your inventory...</span>
        </div>
      </motion.div>
    )
  }

  if (visibleInsights.length === 0) return null

  const getIcon = (type: string) => {
    switch (type) {
      case 'expiry_warning': return <AlertTriangle className="w-6 h-6" />
      case 'meal_suggestion': return <ChefHat className="w-6 h-6" />
      case 'pattern': return <Sparkles className="w-6 h-6" />
      default: return <Clock className="w-6 h-6" />
    }
  }

  const getColors = (insight: ProactiveInsight) => {
    if (insight.type === 'expiry_warning' && insight.urgency === 'high') {
      return {
        bg: 'bg-red-500/[0.06]',
        border: 'border-red-500/20',
        icon: 'bg-red-500/15 text-red-500',
        title: 'text-red-500',
      }
    }
    if (insight.type === 'expiry_warning') {
      return {
        bg: 'bg-amber-500/[0.06]',
        border: 'border-amber-500/20',
        icon: 'bg-amber-500/15 text-amber-500',
        title: 'text-amber-500',
      }
    }
    if (insight.type === 'meal_suggestion') {
      return {
        bg: 'bg-orange-500/[0.06]',
        border: 'border-orange-500/20',
        icon: 'bg-orange-500/15 text-orange-500',
        title: 'text-orange-500',
      }
    }
    return {
      bg: 'bg-emerald-500/[0.06]',
      border: 'border-emerald-500/20',
      icon: 'bg-emerald-500/15 text-emerald-500',
      title: 'text-emerald-500',
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 space-y-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20">
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <h2 className="text-sm font-black text-foreground/70 uppercase tracking-[0.2em]">Guard AI Insights</h2>
        </div>
        <button
          onClick={fetchInsights}
          className="p-1.5 rounded-lg text-[var(--text-faint)] hover:text-[var(--text-muted)] hover:bg-[var(--glass-bg)] transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Cards */}
      <AnimatePresence>
        {visibleInsights.map((insight, index) => {
          const colors = getColors(insight)
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-6 rounded-3xl ${colors.bg} border ${colors.border} group shadow-lg shadow-[var(--shadow-color)]`}
            >
              <button
                onClick={() => setDismissed((prev) => [...prev, index])}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 rounded-lg text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-all"
              >
                <X className="w-3 h-3" />
              </button>

              <div className="flex gap-3">
                <div className={`p-3 rounded-2xl ${colors.icon} shrink-0 h-fit`}>
                  {getIcon(insight.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-base font-bold ${colors.title} mb-1`}>
                    {insight.title}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    {insight.body}
                  </p>
                  {insight.items && insight.items.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {insight.items.map((item, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[10px] text-[var(--text-muted)]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                  {insight.type === 'meal_suggestion' && (
                    <button
                      onClick={() => router.push('/recipes')}
                      className="flex items-center gap-1 mt-2 text-[10px] font-bold text-orange-500 uppercase tracking-wider hover:underline"
                    >
                      View Recipes <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </motion.div>
  )
}
