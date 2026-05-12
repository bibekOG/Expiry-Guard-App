'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera,
  Zap,
  CheckCircle,
  AlertCircle,
  Keyboard,
  X,
  Plus
} from 'lucide-react'
import { lookupBarcode, type BarcodeResult } from '@/lib/barcode'
import { useRouter } from 'next/navigation'

interface ScannerProps {
  onSuccess?: (result: BarcodeResult) => void
  isEmbedded?: boolean
}

export default function Scanner({ onSuccess, isEmbedded = false }: ScannerProps) {
  const router = useRouter()
  const [isScanning, setIsScanning] = useState(true)
  const [manualCode, setManualCode] = useState('')
  const [showManual, setShowManual] = useState(false)
  const [result, setResult] = useState<BarcodeResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [scannedCodes, setScannedCodes] = useState<string[]>([])
  const scannerRef = useRef<HTMLDivElement>(null)
  const html5QrCodeRef = useRef<any>(null)

  const handleBarcode = useCallback(
    async (code: string) => {
      if (scannedCodes.includes(code) || isLoading) return
      setScannedCodes((prev) => [...prev, code])
      setIsLoading(true)
      setError(null)

      const data = await lookupBarcode(code)

      if (data) {
        setResult(data)
        if (onSuccess) onSuccess(data)
        // Stop scanner on success
        if (html5QrCodeRef.current) {
          try {
            await html5QrCodeRef.current.stop()
          } catch {
            // ignore
          }
        }
      } else {
        setError(`Product not found: ${code}`)
      }
      setIsLoading(false)
    },
    [scannedCodes, isLoading, onSuccess]
  )

  useEffect(() => {
    if (!isScanning || !scannerRef.current || result) return

    let scanner: any = null

    const startScanner = async () => {
      const { Html5Qrcode } = await import('html5-qrcode')
      scanner = new Html5Qrcode('barcode-reader')
      html5QrCodeRef.current = scanner

      try {
        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 280, height: 150 },
            aspectRatio: 1.0,
          },
          (decodedText: string) => {
            handleBarcode(decodedText)
          },
          () => {}
        )
      } catch (err) {
        setError('Camera access denied. Use manual entry.')
        setIsScanning(false)
      }
    }

    startScanner()

    return () => {
      if (scanner) {
        try {
          scanner.stop()
        } catch {
          // ignore
        }
      }
    }
  }, [isScanning, handleBarcode, result])

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
    <div className="w-full max-w-2xl mx-auto">
      {/* Manual Entry Toggle */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowManual(!showManual)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-foreground hover:bg-[var(--glass-bg)] transition-all"
        >
          <Keyboard className="w-4 h-4" />
          {showManual ? 'Hide Manual' : 'Manual Entry'}
        </button>
      </div>

      <AnimatePresence>
        {showManual && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleManualSubmit}
            className="mb-6 overflow-hidden"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Enter barcode number..."
                className="flex-1 px-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-foreground placeholder-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
              />
              <button
                type="submit"
                disabled={isLoading || !manualCode.trim()}
                className="px-4 py-3 bg-emerald-500 text-white rounded-xl text-sm font-bold disabled:opacity-50"
              >
                Go
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Scanner View */}
      <div className="relative aspect-square sm:aspect-video rounded-3xl overflow-hidden border-2 border-[var(--glass-border)] bg-black shadow-2xl">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="scanner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full"
            >
              <div id="barcode-reader" className="w-full h-full" />
              
              {/* Overlay UI */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                 <div className="w-64 h-32 border-2 border-emerald-500/50 rounded-2xl relative">
                    <motion.div 
                      animate={{ y: [0, 120, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)]"
                    />
                 </div>
                 <p className="mt-8 text-white/50 text-xs font-bold uppercase tracking-[0.2em]">Align Barcode</p>
              </div>

              {isLoading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                  <span className="text-white text-sm font-medium tracking-wide">Identifying...</span>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-[var(--background)] p-6 flex flex-col items-center justify-center text-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-1">{result.name}</h3>
              <p className="text-sm text-[var(--text-faint)] mb-6">{result.category} • {result.barcode}</p>

              <div className="flex gap-3 w-full">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddItem}
                  className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add to Fridge
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetScan}
                  className="px-6 py-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] text-foreground rounded-2xl font-bold"
                >
                  Retry
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-500 font-medium">{error}</p>
          <button onClick={resetScan} className="ml-auto text-xs font-bold text-red-500 underline">Try Again</button>
        </motion.div>
      )}
    </div>
  )
}
