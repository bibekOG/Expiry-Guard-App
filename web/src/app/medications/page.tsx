'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Pill,
  AlertTriangle,
  Clock,
  Bell,
  CheckCircle,
  Shield,
  Loader2,
} from 'lucide-react'
import type { Item } from '@/lib/types'

export default function MedicationsPage() {
  const router = useRouter()
  const [meds, setMeds] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [acknowledging, setAcknowledging] = useState<string | null>(null)
  const [showAckModal, setShowAckModal] = useState<Item | null>(null)

  useEffect(() => {
    loadMedications()
  }, [])

  async function loadMedications() {
    try {
      const res = await fetch('/api/medications')
      const data = await res.json()
      setMeds(data.items || [])
    } catch {
      // ignore
    } finally {
      setIsLoading(false)
    }
  }

  function getDaysUntilExpiry(expiresAt: string | null): number | null {
    if (!expiresAt) return null
    const now = new Date()
    const expiry = new Date(expiresAt)
    return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  function getExpiryLabel(days: number | null): { label: string; color: string } {
    if (days === null) return { label: 'No expiry set', color: 'text-[var(--text-faint)]' }
    if (days < 0) return { label: `Expired ${Math.abs(days)}d ago`, color: 'text-red-500' }
    if (days === 0) return { label: 'Expires today!', color: 'text-red-500' }
    if (days <= 7) return { label: `${days} days left`, color: 'text-amber-500' }
    if (days <= 30) return { label: `${days} days left`, color: 'text-yellow-400' }
    return { label: `${days} days left`, color: 'text-emerald-500' }
  }

  async function acknowledgeExpiry(item: Item) {
    setAcknowledging(item.id)
    try {
      const res = await fetch('/api/acknowledge-med', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id, action: 'discarded' }),
      })
      if (res.ok) {
        setMeds((prev) => prev.filter((m) => m.id !== item.id))
      }
    } catch {
      // ignore
    } finally {
      setAcknowledging(null)
      setShowAckModal(null)
    }
  }

  const activeMeds = meds.filter((m) => m.status === 'active' || m.status === 'expiring_soon')
  const expiredMeds = meds.filter((m) => m.status === 'expired')

  return (
    <div className="min-h-screen bg-background">
      {/* Header — distinct coral/red theme for medications (gemini.md Rule #3) */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-rose-500/10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16 gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 -ml-2 rounded-xl text-[var(--text-muted)] hover:text-foreground hover:bg-[var(--glass-bg)] transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center">
                <Pill className="w-4 h-4 text-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Medications</h1>
                <p className="text-xs text-rose-500/60">
                  Track expiry & dosage
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-rose-500 animate-spin mb-4" />
            <p className="text-sm text-[var(--text-faint)]">Loading medications...</p>
          </div>
        ) : meds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-rose-500/30" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-muted)] mb-1">
              No medications tracked
            </h3>
            <p className="text-sm text-[var(--text-faint)] max-w-xs">
              Add medications from the main dashboard with the &quot;Medication&quot;
              category to see them here.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/add?category=medication')}
              className="mt-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg shadow-rose-500/25"
            >
              <Pill className="w-4 h-4" />
              Add Medication
            </motion.button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Expired — Requires explicit acknowledgment */}
            {expiredMeds.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <h2 className="text-sm font-bold text-red-500 uppercase tracking-wider">
                    Expired — Action Required
                  </h2>
                </div>
                <div className="space-y-2">
                  {expiredMeds.map((med, index) => {
                    const days = getDaysUntilExpiry(med.expires_at)
                    const expiry = getExpiryLabel(days)
                    return (
                      <motion.div
                        key={med.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-xl bg-red-500/[0.06] border border-red-500/20"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-foreground">
                              💊 {med.name}
                            </h3>
                            <p className={`text-xs mt-1 ${expiry.color}`}>
                              {expiry.label}
                            </p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowAckModal(med)}
                            className="px-4 py-2 bg-red-500/15 border border-red-500/30 rounded-xl text-xs text-red-500 font-medium"
                          >
                            <Bell className="w-3.5 h-3.5 inline mr-1" />
                            Acknowledge
                          </motion.button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Active */}
            {activeMeds.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <h2 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Active Medications
                  </h2>
                </div>
                <div className="space-y-2">
                  {activeMeds.map((med, index) => {
                    const days = getDaysUntilExpiry(med.expires_at)
                    const expiry = getExpiryLabel(days)
                    return (
                      <motion.div
                        key={med.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-rose-500/20 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-foreground">
                              💊 {med.name}
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-[var(--text-faint)]">
                                {med.quantity_amount} {med.quantity_unit}
                              </span>
                              <span className="text-xs text-[var(--text-faint)]">•</span>
                              <span className={`text-xs flex items-center gap-1 ${expiry.color}`}>
                                <Clock className="w-3 h-3" />
                                {expiry.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Acknowledgment Modal — Explicit per gemini.md Rule #3 */}
        <AnimatePresence>
          {showAckModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/70 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-sm bg-card-bg border border-red-500/20 rounded-3xl p-6 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-red-500/15 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-lg font-bold text-foreground mb-2">
                  Medication Expired
                </h2>
                <p className="text-sm text-[var(--text-muted)] mb-1">
                  <strong className="text-foreground">{showAckModal.name}</strong>{' '}
                  has expired.
                </p>
                <p className="text-xs text-red-500/60 mb-6">
                  Please dispose of this medication safely and consult your pharmacist if you need a replacement.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAckModal(null)}
                    className="flex-1 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--text-muted)] font-medium"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => acknowledgeExpiry(showAckModal)}
                    disabled={acknowledging === showAckModal.id}
                    className="flex-1 py-3 text-white font-medium disabled:opacity-50"
                  >
                    {acknowledging ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                      'Confirm Disposal'
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
