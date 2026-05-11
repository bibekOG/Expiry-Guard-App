'use client'

import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Home,
  Scan,
  TrendingUp,
  Users,
  Plus,
} from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  const tabs = [
    { id: '/', icon: Home, label: 'Home' },
    { id: '/scan', icon: Scan, label: 'Scan' },
    { id: '/add', icon: Plus, label: 'Add', primary: true },
    { id: '/analytics', icon: TrendingUp, label: 'Stats' },
    { id: '/household', icon: Users, label: 'Team' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-6 pt-2 bg-gradient-to-t from-[#0a0b0f] via-[#0a0b0f] to-transparent pointer-events-none sm:hidden">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="flex items-center justify-around bg-card-bg/90 backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl p-2 shadow-2xl shadow-[var(--shadow-color)]">
          {tabs.map((tab) => {
            const isActive = pathname === tab.id
            const Icon = tab.icon

            if (tab.primary) {
              return (
                <button
                  key={tab.id}
                  onClick={() => router.push(tab.id)}
                  className="relative -top-6 w-14 h-14 rounded-full bg-gradient-to-br text-white shadow-xl shadow-emerald-500/30 flex items-center justify-center transition-transform active:scale-95"
                >
                  <Icon className="w-6 h-6" />
                </button>
              )
            }

            return (
              <button
                key={tab.id}
                onClick={() => router.push(tab.id)}
                className="flex flex-col items-center gap-1 p-2 rounded-xl transition-colors relative"
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-emerald-500' : 'text-[var(--text-faint)]'
                  }`}
                />
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isActive ? 'text-emerald-500' : 'text-[var(--text-faint)]'
                  }`}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="bottomNavDot"
                    className="absolute -bottom-1 w-1 h-1 rounded-full bg-emerald-400"
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
