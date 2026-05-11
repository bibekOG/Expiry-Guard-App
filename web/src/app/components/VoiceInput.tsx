'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Sparkles, X, Loader2, Check, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface VoiceInputProps {
  onItemsParsed: (items: any[]) => void
}

export default function VoiceInput({ onItemsParsed }: VoiceInputProps) {
  const router = useRouter()
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isParsing, setIsParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [addedItems, setAddedItems] = useState<string[]>([])
  const recognitionRef = useRef<any>(null)
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Check browser support
  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
    setIsRecording(false)
  }, [])

  // Parse the transcript through Groq
  const parseAndAdd = useCallback(async (text: string) => {
    if (!text.trim()) return
    setIsParsing(true)
    setError(null)

    try {
      const res = await fetch('/api/parse-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text }),
      })
      const data = await res.json()

      if (data.success) {
        if (data.intent === 'NAVIGATE' && data.route) {
          router.push(data.route)
          setAddedItems(['Navigating...'])
          setTimeout(() => { setAddedItems([]); setTranscript('') }, 2000)
        } else if (data.intent === 'REMOVE' && data.remove_items?.length > 0) {
          const removeRes = await fetch('/api/remove-item-by-name', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ names: data.remove_items }),
          })
          if (removeRes.ok) {
            setAddedItems(data.remove_items.map((i: string) => `Removed ${i}`))
            onItemsParsed([])
            setTimeout(() => { setAddedItems([]); setTranscript('') }, 3000)
            router.refresh()
          } else {
            setError('Failed to remove items.')
          }
        } else if (data.intent === 'ADD' && data.items?.length > 0) {
          // Save items to database
          for (const item of data.items) {
            await fetch('/api/add-item', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item),
            })
          }
          setAddedItems(data.items.map((i: any) => `${i.quantity_amount} ${i.quantity_unit} ${i.name}`))
          onItemsParsed(data.items)
          
          // Clear success state after 3s
          setTimeout(() => {
            setAddedItems([])
            setTranscript('')
          }, 3000)
          
          router.refresh()
        } else {
          setError('Could not understand command. Try again.')
        }
      } else {
        setError(data.error || 'Could not understand. Try again.')
      }
    } catch {
      setError('Failed to process. Check your connection.')
    } finally {
      setIsParsing(false)
    }
  }, [onItemsParsed, router])

  const startRecording = useCallback(() => {
    if (!isSupported) return
    setError(null)
    setAddedItems([])
    setTranscript('')

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    let finalTranscript = ''

    recognition.onresult = (event: any) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript + ' '
        } else {
          interim += result[0].transcript
        }
      }
      setTranscript(finalTranscript + interim)

      // Auto-submit after 2s of silence
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = setTimeout(() => {
        stopRecording()
        if (finalTranscript.trim()) {
          parseAndAdd(finalTranscript.trim())
        }
      }, 2000)
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow it in browser settings.')
      } else if (event.error === 'network') {
        setError('Network error: The speech service is unreachable. Check your internet connection or try using Chrome/Edge.')
      } else if (event.error === 'no-speech') {
        setError('No speech was detected. Try again.')
      } else if (event.error === 'aborted') {
        setError('Voice input was stopped.')
      } else {
        setError(`Voice error: ${event.error}`)
      }
      
      stopRecording()
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
  }, [isSupported, stopRecording, parseAndAdd])

  useEffect(() => {
    return () => {
      stopRecording()
    }
  }, [stopRecording])

  if (!isSupported) return null

  return (
    <div className="fixed bottom-24 right-6 z-40">
      <AnimatePresence>
        {(isRecording || isParsing || addedItems.length > 0 || error) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-16 right-0 w-72 backdrop-blur-2xl bg-background/95 border border-[var(--glass-border)] rounded-2xl p-5 shadow-2xl shadow-[var(--shadow-color)]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {isRecording && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                {isParsing && <Loader2 className="w-3 h-3 text-emerald-500 animate-spin" />}
                {addedItems.length > 0 && <Check className="w-3 h-3 text-emerald-500" />}
                {error && <AlertCircle className="w-3 h-3 text-red-500" />}
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  {isRecording ? 'Listening...' : isParsing ? 'Processing...' : addedItems.length > 0 ? 'Done!' : 'Error'}
                </span>
              </div>
              <button 
                onClick={() => { stopRecording(); setError(null); setAddedItems([]); setTranscript('') }} 
                className="text-[var(--text-faint)] hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Live transcript */}
            {(isRecording || isParsing) && transcript && (
              <p className="text-xs text-foreground/70 italic leading-relaxed mb-2">
                &ldquo;{transcript}&rdquo;
              </p>
            )}

            {/* Hint */}
            {isRecording && !transcript && (
              <p className="text-[11px] text-[var(--text-faint)] leading-relaxed">
                Try saying: <span className="text-emerald-500/60">&ldquo;Add two liters of milk and a dozen eggs&rdquo;</span>
              </p>
            )}

            {/* Success */}
            {addedItems.length > 0 && (
              <div className="space-y-1">
                {addedItems.map((item, i) => {
                  const isRemoval = item.includes('Removed') || item.includes('Navigating')
                  return (
                    <div key={i} className={`flex items-center gap-2 text-xs ${isRemoval ? 'text-amber-500' : 'text-emerald-500'}`}>
                      <Check className="w-3 h-3 shrink-0" />
                      <span>{item}</span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="text-xs text-red-500/80">{error}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mic Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isParsing}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
          isRecording 
            ? 'bg-red-500 shadow-red-500/40 animate-pulse' 
            : isParsing
            ? 'bg-amber-500 shadow-amber-500/40 cursor-wait'
            : 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/40'
        }`}
      >
        {isParsing ? (
          <Loader2 className="w-6 h-6 text-foreground animate-spin" />
        ) : isRecording ? (
          <MicOff className="w-6 h-6 text-foreground" />
        ) : (
          <Mic className="w-6 h-6 text-foreground" />
        )}
        {!isRecording && !isParsing && (
          <div className="absolute -top-1 -right-1">
            <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
          </div>
        )}
      </motion.button>
    </div>
  )
}
