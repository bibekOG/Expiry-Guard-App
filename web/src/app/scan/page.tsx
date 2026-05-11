'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Camera,
  Zap,
  CheckCircle,
  AlertCircle,
  Keyboard,
  X,
} from 'lucide-react'
import { lookupBarcode, type BarcodeResult } from '@/lib/barcode'

export default function ScanPage() {
  const router = useRouter()
  const [isScanning, setIsScanning] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [showManual, setShowManual] = useState(false)
  const [result, setResult] = useState<BarcodeResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [scannedCodes, setScannedCodes] = useState<string[]>([])
  const scannerRef = useRef<HTMLDivElement>(null)
  const html5QrCodeRef = useRef<unknown>(null)

  const handleBarcode = useCallback(
    async (code: string) => {
      if (scannedCodes.includes(code) || isLoading) return
      setScannedCodes((prev) => [...prev, code])
      setIsLoading(true)
      setError(null)

      const data = await lookupBarcode(code)

      if (data) {
        setResult(data)
        // Stop scanner on success
        if (html5QrCodeRef.current) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (html5QrCodeRef.current as any).stop()
          } catch {
            // ignore
          }
        }
      } else {
        setError(`Product not found for barcode: ${code}`)
      }
      setIsLoading(false)
    },
    [scannedCodes, isLoading]
  )

  useEffect(() => {
    if (!isScanning || !scannerRef.current) return

    let scanner: unknown = null

    const startScanner = async () => {
      const { Html5Qrcode } = await import('html5-qrcode')
      scanner = new Html5Qrcode('barcode-reader')
      html5QrCodeRef.current = scanner

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (scanner as any).start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 280, height: 150 },
            aspectRatio: 1.0,
          },
          (decodedText: string) => {
            handleBarcode(decodedText)
          },
          () => {
            // ignore scan failures (continuous scanning)
          }
        )
      } catch (err) {
        setError(
          'Camera access denied. Please allow camera permissions or enter barcode manually.'
        )
        setIsScanning(false)
        console.error(err)
      }
    }

    startScanner()

    return () => {
      if (scanner) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(scanner as any).stop()
        } catch {
          // ignore
        }
      }
    }
  }, [isScanning, handleBarcode])

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (manualCode.trim()) {
      await handleBarcode(manualCode.trim())
    }
  }

  const handleAddItem = () => {
    if (!result) return
    const params = new URLSearchParams({
      name: result.name,
      category: result.category,
      barcode: result.barcode,
      source: 'barcode',
      ...(result.image_url ? { image_url: result.image_url } : {}),
    })
    router.push(`/add?${params.toString()}`)
  }

  const resetScan = () => {
    setResult(null)
    setError(null)
    setScannedCodes([])
    setIsScanning(true)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-[var(--glass-border)]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 -ml-2 rounded-xl text-[var(--text-muted)] hover:text-foreground hover:bg-[var(--glass-bg)] transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-bold text-foreground">
                Barcode Scanner
              </h1>
            </div>
            <button
              onClick={() => setShowManual(!showManual)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[var(--text-muted)] hover:text-foreground hover:bg-[var(--glass-bg)] transition-all"
            >
              <Keyboard className="w-4 h-4" />
              <span className="hidden sm:inline">Manual</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Manual Entry */}
        <AnimatePresence>
          {showManual && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleManualSubmit}
              className="mb-6"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Enter barcode number..."
                  className="flex-1 px-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-foreground placeholdertext-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading || !manualCode.trim()}
                  className="px-4 py-3 text-white rounded-xl text-sm font-medium disabled:opacity-50"
                >
                  Look Up
                </motion.button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Scanner */}
        {!result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {!isScanning ? (
              <div className="flex flex-col items-center justify-center py-20">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center mb-6"
                >
                  <Camera className="w-12 h-12 text-emerald-500" />
                </motion.div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Scan a Barcode
                </h2>
                <p className="text-sm text-[var(--text-faint)] text-center mb-8 max-w-xs">
                  Point your camera at a product barcode to instantly add it to
                  your inventory
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsScanning(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25"
                >
                  <Zap className="w-5 h-5" />
                  Start Scanning
                </motion.button>
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  id="barcode-reader"
                  ref={scannerRef}
                  className="rounded-2xl overflow-hidden border border-[var(--glass-border)] bg-background"
                />
                {isLoading && (
                  <div className="flex items-center justify-center gap-2 py-4">
                    <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                    <span className="text-sm text-[var(--text-muted)]">
                      Looking up product...
                    </span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-500">{error}</p>
                <button
                  onClick={resetScan}
                  className="text-xs text-red-500/60 hover:text-red-500 mt-1 underline"
                >
                  Try again
                </button>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-500/50 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4"
            >
              <div className="p-6 rounded-2xl bg-[var(--glass-bg)] border border-emerald-500/20 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-foreground">
                      {result.name}
                    </h3>
                    {result.brands && (
                      <p className="text-sm text-[var(--text-faint)]">{result.brands}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 text-xs font-medium">
                        {result.category}
                      </span>
                      <span className="text-xs text-[var(--text-faint)]">
                        {result.barcode}
                      </span>
                    </div>
                  </div>
                  {result.image_url && (
                    <img
                      src={result.image_url}
                      alt={result.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddItem}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium text-sm shadow-lg shadow-emerald-500/25"
                  >
                    Add to Inventory
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={resetScan}
                    className="px-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-muted)] rounded-xl text-sm font-medium"
                  >
                    Scan Another
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Batch History */}
        {scannedCodes.length > 0 && (
          <div className="mt-6">
            <p className="text-xs text-[var(--text-faint)] mb-2">
              Scanned: {scannedCodes.length} barcode
              {scannedCodes.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
