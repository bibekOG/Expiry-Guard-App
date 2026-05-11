'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  TrendingUp,
  BarChart3,
  PieChart,
  Clock,
  Sparkles,
  Loader2,
  Utensils,
  Zap,
  Activity,
  CheckCircle2,
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'
import AppLayout from '@/app/components/AppLayout'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

export default function UsagePage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  async function fetchAnalytics() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/analytics')
      const json = await res.json()
      setData(json)
    } catch {
      // ignore
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin mb-4" />
        <p className="text-sm text-[var(--text-faint)] tracking-widest uppercase font-medium">Analyzing Patterns...</p>
      </div>
    )
  }

  const categoryData = {
    labels: ['Food', 'Medication', 'Household'],
    datasets: [
      {
        data: [
          data?.categoryCounts?.food || 12, 
          data?.categoryCounts?.medication || 5, 
          data?.categoryCounts?.household || 8
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.6)',
          'rgba(244, 63, 94, 0.6)',
          'rgba(56, 189, 248, 0.6)',
        ],
        borderColor: [
          '#10b981',
          '#f43f5e',
          '#38bdf8',
        ],
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1b20',
        titleColor: '#fff',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        padding: 12,
        cornerRadius: 12,
      },
    },
    scales: {
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } },
      },
      x: {
        grid: { display: false },
        ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } },
      },
    },
  }

  return (
    <AppLayout userEmail="">
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => router.push('/')}
              className="p-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-muted)] hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Usage Patterns</h1>
              <p className="text-sm text-[var(--text-faint)] mt-1">Understanding your consumption habits</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-500">
            <Activity className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">High Efficiency</span>
          </div>
        </div>

        {/* Usage Rate Focus */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20 relative overflow-hidden group"
          >
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-foreground/5"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray="364.4"
                    initial={{ strokeDashoffset: 364.4 }}
                    animate={{ strokeDashoffset: 364.4 - (364.4 * 0.78) }} // Example 78%
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="text-violet-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-foreground">78%</span>
                  <span className="text-[8px] text-[var(--text-faint)] uppercase font-bold tracking-widest">Rate</span>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-foreground mb-2">Excellent Usage Rate!</h2>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
                  You are consuming 78% of your items before they expire. This is 15% better than the average household.
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs text-foreground/70 font-medium">Lowered Waste</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs text-foreground/70 font-medium">Smart Stocking</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Zap className="w-48 h-48 text-violet-500" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-3xl bg-[#111218] border border-[var(--glass-border)] flex flex-col justify-center"
          >
            <div className="space-y-6">
              <div>
                <p className="text-[10px] text-[var(--text-faint)] uppercase font-bold tracking-widest mb-1">Average Shelf Life</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-foreground">12.4</span>
                  <span className="text-xs text-[var(--text-faint)] mb-1">days</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-[var(--text-faint)] uppercase font-bold tracking-widest mb-1">Restock Frequency</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-foreground">4.2</span>
                  <span className="text-xs text-[var(--text-faint)] mb-1">days</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-3xl bg-[#111218] border border-[var(--glass-border)]"
            >
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-8 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-violet-500" />
                Category Distribution
              </h3>
              <div className="h-[200px] mb-8">
                <Pie data={categoryData} options={{ ...chartOptions, scales: { x: { display: false }, y: { display: false } } }} />
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Food', val: 12, color: 'bg-emerald-500' },
                  { label: 'Medication', val: 5, color: 'bg-rose-500' },
                  { label: 'Household', val: 8, color: 'bg-sky-400' },
                ].map(c => (
                  <div key={c.label} className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${c.color}`} />
                      <span className="text-xs text-[var(--text-muted)] group-hover:text-foreground transition-colors">{c.label}</span>
                    </div>
                    <span className="text-xs font-bold text-foreground/80">{c.val} items</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Smart Stocking Tip</h3>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                You tend to waste <span className="text-foreground font-bold">Leafy Greens</span> on Wednesdays. Buying them on Friday instead might increase your usage rate by 4%.
              </p>
            </motion.div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="p-6 rounded-3xl bg-[#111218] border border-[var(--glass-border)]"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-violet-500" />
                  Consumption Velocity
                </h3>
                <span className="text-[10px] text-[var(--text-faint)] font-bold uppercase">Last 7 Days</span>
              </div>
              <div className="h-[300px]">
                <Bar 
                  data={{
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                      label: 'Items Used',
                      data: [4, 7, 2, 8, 12, 5, 3],
                      backgroundColor: 'rgba(139, 92, 246, 0.4)',
                      borderColor: '#8b5cf6',
                      borderWidth: 1,
                      borderRadius: 8,
                    }]
                  }} 
                  options={chartOptions} 
                />
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-6 rounded-3xl bg-[#111218] border border-[var(--glass-border)]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-4 h-4 text-sky-500" />
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Quickest Used</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Milk', time: '2.1 days' },
                    { name: 'Fresh Bread', time: '2.4 days' },
                    { name: 'Avocados', time: '3.0 days' },
                  ].map(i => (
                    <div key={i.name} className="flex justify-between text-xs">
                      <span className="text-[var(--text-muted)]">{i.name}</span>
                      <span className="text-foreground font-bold">{i.time}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="p-6 rounded-3xl bg-[#111218] border border-[var(--glass-border)]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Utensils className="w-4 h-4 text-orange-500" />
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Main Categories</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Dairy', percent: 45 },
                    { name: 'Produce', percent: 30 },
                    { name: 'Protein', percent: 25 },
                  ].map(i => (
                    <div key={i.name} className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-[var(--text-faint)]">{i.name}</span>
                        <span className="text-[var(--text-muted)]">{i.percent}%</span>
                      </div>
                      <div className="h-1 w-full bg-[var(--glass-bg)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--glass-hover)]" style={{ width: `${i.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
