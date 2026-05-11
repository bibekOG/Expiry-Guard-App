'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Camera,
  Upload,
  FileImage,
  Loader2,
  CheckCircle,
  X,
  Save,
  Trash2,
} from 'lucide-react'

interface ReceiptItem {
  name: string
  quantity_amount: number
  quantity_unit: string
  category: string
  financial_value: number | null
  storage_location: string
  selected: boolean
}

export default function ReceiptPage() {
  const router = useRouter()
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [items, setItems] = useState<ReceiptItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const processReceipt = async () => {
    if (!imagePreview) return
    setIsProcessing(true)
    setError(null)

    try {
      const res = await fetch('/api/ocr-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imagePreview }),
      })

      const data = await res.json()

      if (data.success && data.items) {
        setItems(
          data.items.map((item: Omit<ReceiptItem, 'selected'>) => ({
            ...item,
            selected: true,
          }))
        )
      } else {
        setError(data.error || 'Failed to process receipt')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleItem = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, selected: !item.selected } : item
      )
    )
  }

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const addAllSelected = async () => {
    const selectedItems = items.filter((item) => item.selected)
    if (selectedItems.length === 0) return

    setIsSaving(true)
    try {
      // Add items one by one via the existing add action
      for (const item of selectedItems) {
        const formData = new FormData()
        formData.set('name', item.name)
        formData.set('category', item.category || 'food')
        formData.set('quantity_amount', String(item.quantity_amount || 1))
        formData.set('quantity_unit', item.quantity_unit || 'piece')
        formData.set(
          'storage_location',
          item.storage_location || 'pantry'
        )
        if (item.financial_value) {
          formData.set('financial_value', String(item.financial_value))
        }

        await fetch('/api/add-item', {
          method: 'POST',
          body: formData,
        })
      }

      router.push('/')
      router.refresh()
    } catch {
      setError('Failed to add items. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-[var(--glass-border)]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16 gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 -ml-2 rounded-xl text-[var(--text-muted)] hover:text-foreground hover:bg-[var(--glass-bg)] transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-foreground">
              Smart Receipt Scanner
            </h1>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {items.length === 0 ? (
          <>
            {/* Upload Area */}
            {!imagePreview ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16"
              >
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-sky-500/20 to-blue-500/20 border border-sky-500/30 flex items-center justify-center mb-6">
                  <FileImage className="w-12 h-12 text-sky-500" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Scan Your Receipt
                </h2>
                <p className="text-sm text-[var(--text-faint)] text-center mb-8 max-w-xs">
                  Take a photo or upload an image of your grocery receipt to
                  auto-extract items
                </p>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg shadow-sky-500/25"
                  >
                    <Camera className="w-5 h-5" />
                    Take Photo
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-muted)] rounded-xl font-medium"
                  >
                    <Upload className="w-5 h-5" />
                    Upload
                  </motion.button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Preview */}
                <div className="relative rounded-2xl overflow-hidden border border-[var(--glass-border)]">
                  <img
                    src={imagePreview}
                    alt="Receipt preview"
                    className="w-full max-h-96 object-contain bg-[var(--glass-bg)]"
                  />
                  <button
                    onClick={() => setImagePreview(null)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-background/50 text-foreground/80 hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Process button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={processReceipt}
                  disabled={isProcessing}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg shadow-sky-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing Receipt...
                    </>
                  ) : (
                    <>
                      <FileImage className="w-5 h-5" />
                      Extract Items
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </>
        ) : (
          /* Extracted Items Review */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                {items.length} Items Found
              </h2>
              <span className="text-sm text-[var(--text-faint)]">
                {items.filter((i) => i.selected).length} selected
              </span>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-xl border transition-all ${
                    item.selected
                      ? 'bg-[var(--glass-bg)] border-emerald-500/20'
                      : 'bg-[var(--glass-bg)] border-[var(--glass-border)] opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleItem(index)}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                        item.selected
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'border-[var(--glass-border)]'
                      }`}
                    >
                      {item.selected && (
                        <CheckCircle className="w-3 h-3 text-foreground" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-foreground truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[var(--text-faint)]">
                        {item.quantity_amount} {item.quantity_unit} •{' '}
                        {item.storage_location}
                        {item.financial_value
                          ? ` • $${item.financial_value}`
                          : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(index)}
                      className="p-1.5 rounded-lg text-[var(--text-faint)] hover:text-red-500 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Batch Add Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={addAllSelected}
              disabled={
                isSaving || items.filter((i) => i.selected).length === 0
              }
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Adding Items...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Add {items.filter((i) => i.selected).length} Items
                </>
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-500 text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
