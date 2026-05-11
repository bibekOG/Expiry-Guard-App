'use client'

import AppLayout from '../components/AppLayout'
import { addItem } from './actions'
import { useState } from 'react'
import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Package,
  Calendar,
  MapPin,
  DollarSign,
  FileText,
  Layers,
  Scale,
  Save,
} from 'lucide-react'

const categories = [
  { value: 'food', label: '🍎 Food', color: 'from-emerald-500/20 to-emerald-500/5' },
  { value: 'medication', label: '💊 Medication', color: 'from-red-500/20 to-red-500/5' },
  { value: 'household', label: '🏠 Household', color: 'from-blue-500/20 to-blue-500/5' },
]

const storageLocations = [
  { value: 'fridge', label: '❄️ Fridge' },
  { value: 'freezer', label: '🧊 Freezer' },
  { value: 'pantry', label: '🗄️ Pantry' },
  { value: 'cabinet', label: '🚪 Cabinet' },
]

const commonUnits = ['piece', 'kg', 'g', 'lb', 'oz', 'liter', 'ml', 'pack', 'box', 'can', 'bottle', 'bag']

function AddItemForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Pre-fill from search params (Scanner/Voice/Receipt)
  const [itemName, setItemName] = useState(searchParams.get('name') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'food')
  const [selectedStorage, setSelectedStorage] = useState(searchParams.get('storage_location') || 'pantry')
  const [quantity, setQuantity] = useState(searchParams.get('quantity_amount') || '1')
  const [unit, setUnit] = useState(searchParams.get('quantity_unit') || 'piece')
  const [expiry, setExpiry] = useState(searchParams.get('expires_at') || '')
  const [value, setValue] = useState(searchParams.get('financial_value') || '')
  
  const [isLoading, setIsLoading] = useState(false)
  const error = searchParams.get('error')

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    try {
      await addItem(formData)
    } catch {
      // redirect throws
    } finally {
      setIsLoading(false)
    }
  }

  // Get tomorrow as default expiry suggestion
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 7)
  const defaultExpiry = tomorrow.toISOString().split('T')[0]

  return (
    <AppLayout>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        <form action={handleSubmit} className="space-y-6">
          {/* Item Name */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="space-y-2"
          >
            <label className="flex items-center gap-2 text-xs font-medium text-[var(--text-faint)] uppercase tracking-wider">
              <Package className="w-3.5 h-3.5" />
              Item Name *
            </label>
            <input
              name="name"
              type="text"
              required
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. Milk, Chicken, Aspirin..."
              autoFocus
              className="w-full px-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-foreground placeholdertext-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
            />
          </motion.div>

          {/* Category */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <label className="flex items-center gap-2 text-xs font-medium text-[var(--text-faint)] uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              Category
            </label>
            <input type="hidden" name="category" value={selectedCategory} />
            <div className="grid grid-cols-3 gap-2 p-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.value
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`relative py-3 px-3 rounded-xl text-sm font-medium transition-colors z-10 ${
                      isActive ? 'text-foreground' : 'text-[var(--text-faint)] hover:text-foreground/70'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeCategoryBg"
                        className={`absolute inset-0 bg-gradient-to-br ${cat.color} rounded-xl shadow-lg border border-[var(--glass-border)] -z-10`}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{cat.label}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* Quantity Row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-2"
          >
            <label className="flex items-center gap-2 text-xs font-medium text-[var(--text-faint)] uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5" />
              Quantity
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                name="quantity_amount"
                type="number"
                step="0.01"
                min="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="px-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
              />
              <select
                name="quantity_unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="px-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none cursor-pointer shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
              >
                {commonUnits.map((unit) => (
                  <option key={unit} value={unit} className="bg-card-bg text-foreground">
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* Storage Location */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <label className="flex items-center gap-2 text-xs font-medium text-[var(--text-faint)] uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5" />
              Storage Location
            </label>
            <input type="hidden" name="storage_location" value={selectedStorage} />
            <div className="grid grid-cols-4 gap-2 p-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl">
              {storageLocations.map((loc) => {
                const isActive = selectedStorage === loc.value
                return (
                  <button
                    key={loc.value}
                    type="button"
                    onClick={() => setSelectedStorage(loc.value)}
                    className={`relative py-3 px-2 rounded-xl text-xs font-medium transition-colors text-center z-10 ${
                      isActive ? 'text-emerald-300' : 'text-[var(--text-faint)] hover:text-foreground/70'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeStorageBg"
                        className="absolute inset-0 bg-emerald-500/15 border border-emerald-500/30 rounded-xl shadow-lg -z-10"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{loc.label}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* Expiry Date */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-2"
          >
            <label className="flex items-center gap-2 text-xs font-medium text-[var(--text-faint)] uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5" />
              Expiry Date
            </label>
            <input
              name="expires_at"
              type="date"
              value={expiry || defaultExpiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all [color-scheme:dark] shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
            />
          </motion.div>

          {/* Estimated Value */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <label className="flex items-center gap-2 text-xs font-medium text-[var(--text-faint)] uppercase tracking-wider">
              <DollarSign className="w-3.5 h-3.5" />
              Estimated Value (optional)
            </label>
            <input
              name="financial_value"
              type="number"
              step="0.01"
              min="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-foreground placeholdertext-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
            />
          </motion.div>

          {/* Notes */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="space-y-2"
          >
            <label className="flex items-center gap-2 text-xs font-medium text-[var(--text-faint)] uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5" />
              Notes (optional)
            </label>
            <textarea
              name="notes"
              rows={2}
              placeholder="Any additional notes..."
              className="w-full px-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-foreground placeholdertext-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
            />
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-2"
          >
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-[var(--glass-border)] border-ttext-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Item
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
      </main>
    </AppLayout>
  )
}

export default function AddItemPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    }>
      <AddItemForm />
    </Suspense>
  )
}
