'use client'

import React from 'react'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import { motion, AnimatePresence } from 'framer-motion'


interface AppLayoutProps {
  children: React.ReactNode
  userEmail?: string
}

export default function AppLayout({ children, userEmail }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      <Sidebar userEmail={userEmail} />
      
      <main className="flex-1 min-w-0 relative z-10 sm:pl-64 pb-20 sm:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key="page-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex flex-col min-h-screen"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav />

      {/* Persistent Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 -translate-y-1/2 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-teal-500/5 translate-y-1/4 blur-[120px]" />
      </div>
    </div>
  )
}
