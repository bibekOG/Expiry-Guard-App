'use client'

import { 
  Shield, 
  LogOut, 
  LayoutDashboard, 
  PlusCircle, 
  Scan, 
  FileText, 
  Flame, 
  Pill, 
  TrendingUp, 
  Users,
  Sun,
  Moon,
  MapPin,
  Coins
} from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useTheme } from '@/lib/ThemeContext'

import { getCurrencySymbol } from '@/lib/constants'

interface SidebarProps {
  userEmail?: string
  userLocation?: string
  userCurrency?: string
}

export default function Sidebar({ userEmail, userLocation, userCurrency }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()

  const handleSignOut = async () => {
    await fetch('/auth/signout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Scan Barcode', path: '/scan', icon: Scan },
    { name: 'Smart OCR', path: '/receipt', icon: FileText },
    { name: 'Eat This Now', path: '/recipes', icon: Flame },
    { name: 'Medications', path: '/medications', icon: Pill },
    { name: 'Analytics', path: '/analytics', icon: TrendingUp },
    { name: 'Households', path: '/household', icon: Users },
  ]

  return (
    <aside className="hidden sm:flex w-64 h-screen fixed top-0 left-0 flex-col backdrop-blur-2xl bg-[var(--sidebar-bg)] border-r border-[var(--glass-border)] z-50 transition-colors duration-300">
      {/* Logo */}
      <div className="p-6">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => router.push('/')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.3)] border border-emerald-300/20 shrink-0">
            <Shield className="w-6 h-6 text-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">
            Expiry Guard
          </span>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'text-foreground' : 'text-[var(--text-faint)] hover:text-foreground/70'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSidebarNav"
                  className="absolute inset-0 bg-[var(--glass-hover)] border border-[var(--glass-border)] rounded-xl -z-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className="w-5 h-5" />
              {item.name}
            </button>
          )
        })}
      </nav>

      {/* User Area */}
      <div className="p-4 border-t border-[var(--glass-border)] space-y-2">
        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(var(--foreground-rgb), 0.05)' }}
          whileTap={{ scale: 0.98 }}
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-[var(--text-muted)] hover:text-foreground transition-all duration-200 bg-[var(--glass-bg)] border border-[var(--glass-border)]"
        >
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <div className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${theme === 'dark' ? 'bg-emerald-500/40' : 'bg-gray-300'}`}>
            <motion.div 
              animate={{ x: theme === 'dark' ? 16 : 0 }}
              className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-foreground shadow-sm"
            />
          </div>
        </motion.button>

        {userEmail && (
          <div className="px-4 py-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] space-y-3">
            <div>
              <p className="text-[10px] text-[var(--text-faint)] uppercase tracking-widest font-bold mb-1 opacity-50">Profile</p>
              <p className="text-sm font-medium text-foreground truncate" title={userEmail}>
                {userEmail}
              </p>
            </div>
            
            <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.03]">
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <MapPin className="w-3.5 h-3.5 text-emerald-500/70" />
                <span className="truncate">{userLocation || 'Location not set'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <Coins className="w-3.5 h-3.5 text-amber-500/70" />
                <span>{userCurrency || 'USD'} ({getCurrencySymbol(userCurrency)})</span>
              </div>
            </div>
          </div>
        )}
        <motion.button
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[var(--text-muted)] hover:text-foreground transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          Sign out
        </motion.button>
      </div>
    </aside>
  )
}
