'use client'

import { Shield, LogOut, User, Settings, Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface NavbarProps {
  userEmail?: string
}

export default function Navbar({ userEmail }: NavbarProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const response = await fetch('/auth/signout', { method: 'POST' })
    if (response.ok) {
      router.push('/login')
      router.refresh()
    }
  }

  return (
    <nav className="sticky top-0 z-50">
      {/* Background with deep blur */}
      <div className="absolute inset-0 backdrop-blur-2xl bg-background/70 border-b border-[var(--glass-border)]" />
      
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-4 cursor-pointer group"
            onClick={() => router.push('/')}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full group-hover:bg-emerald-500/30 transition-colors" />
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.3)] border border-emerald-300/20">
                <Shield className="w-6 h-6 text-foreground" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground tracking-tight leading-none">
                Expiry Guard
              </span>
              <span className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-[0.2em] mt-1">
                Household Shield
              </span>
            </div>
          </motion.div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Notification Bell (Visual Only) */}
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.05)' }}
              whileTap={{ scale: 0.9 }}
              className="p-2.5 rounded-xl text-[var(--text-faint)] hover:text-foreground transition-all relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#050608]" />
            </motion.button>

            {/* Profile Dropdown (Simplified) */}
            <div className="h-8 w-[1px] bg-[var(--glass-bg)] mx-2 hidden sm:block" />
            
            <div className="flex items-center gap-3 pl-2">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-xs font-bold text-foreground/80">{userEmail?.split('@')[0]}</span>
                <span className="text-[9px] text-[var(--text-faint)] font-medium uppercase tracking-wider">Premium Member</span>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignOut}
                className="w-10 h-10 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-faint)] hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-all group"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
