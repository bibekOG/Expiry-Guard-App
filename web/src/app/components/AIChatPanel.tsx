'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, Sparkles, X, BrainCircuit, Loader2, MessageCircle } from 'lucide-react'

const QUICK_PROMPTS = [
  "What's in my fridge?",
  "What's expiring this week?",
  "Suggest a recipe for tonight",
  "How much money have I saved?",
  "What do I waste the most?",
]

export default function AIChatPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hey! 👋 I'm Guard AI. Ask me anything about your inventory — what's expiring, recipe ideas, or your spending patterns. Try the quick prompts below!" }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (text?: string) => {
    const query = text || input.trim()
    if (!query || isLoading) return

    const userMessage = { role: 'user', text: query }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/ai-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })

      const data = await res.json()
      
      if (data.success) {
        setMessages(prev => [...prev, { role: 'bot', text: data.response }])
      } else {
        setMessages(prev => [...prev, { role: 'bot', text: `Sorry, I'm having trouble connecting to my brain right now. ${data.error || ''}` }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, there was an error connecting to the server." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] flex items-center justify-center shadow-2xl shadow-[var(--shadow-color)] hover:bg-[var(--glass-bg)] transition-all"
        >
          <Bot className="w-6 h-6 text-emerald-500" />
          <div className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 items-center justify-center">
              <Sparkles className="w-2 h-2 text-foreground" />
            </span>
          </div>
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className="fixed inset-y-4 right-4 w-80 md:w-96 z-50 flex flex-col backdrop-blur-3xl bg-background/95 border border-[var(--glass-border)] rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-[var(--glass-border)] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Guard AI</h3>
                  <p className="text-[10px] text-emerald-500/60 font-bold uppercase tracking-widest">Powered by Llama 3</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl hover:bg-[var(--glass-bg)] text-[var(--text-faint)] hover:text-foreground transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === 'bot' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    m.role === 'bot' 
                      ? 'bg-[var(--glass-bg)] border border-[var(--glass-border)] text-foreground/80' 
                      : 'text-white shadow-lg shadow-emerald-500/20'
                  }`}>
                    {/* Render markdown-like formatting */}
                    {m.text.split('\n').map((line, j) => (
                      <span key={j}>
                        {line}
                        {j < m.text.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed bg-[var(--glass-bg)] border border-[var(--glass-border)] text-foreground/80 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 2 && (
              <div className="px-5 pb-2 flex flex-wrap gap-1.5 shrink-0">
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[10px] text-[var(--text-muted)] hover:text-foreground hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all disabled:opacity-30"
                  >
                    <MessageCircle className="w-2.5 h-2.5 inline mr-1" />
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-5 pt-2 shrink-0">
              <div className="relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSend()
                  }}
                  disabled={isLoading}
                  placeholder="Ask about your inventory..."
                  className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl py-3.5 pl-5 pr-14 text-xs text-foreground placeholdertext-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
