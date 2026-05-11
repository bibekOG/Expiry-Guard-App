'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  TrendingUp,
  Trash2,
  UtensilsCrossed,
  DollarSign,
  Calendar,
  Sparkles,
  Loader2,
  AlertCircle,
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
import { Line, Bar, Pie } from 'react-chartjs-2'

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

export default function AnalyticsPage() {
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
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
        <p className="text-sm text-[var(--text-faint)] tracking-widest uppercase font-medium">Analyzing Data...</p>
      </div>
    )
  }

  const wasteData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Value Wasted ($)',
        data: data?.wasteTrend || [0, 0, 0, 0, 0, 0, 0],
        borderColor: '#f87171',
        backgroundColor: 'rgba(248, 113, 113, 0.2)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Value Consumed ($)',
        data: data?.consumptionTrend || [0, 0, 0, 0, 0, 0, 0],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const categoryData = {
    labels: ['Food', 'Medication', 'Household'],
    datasets: [
      {
        data: data?.categorySplit || [1, 1, 1],
        backgroundColor: [
          'rgba(16, 185, 129, 0.6)',
          'rgba(244, 63, 94, 0.6)',
          'rgba(56, 189, 248, 0.6)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(244, 63, 94, 1)',
          'rgba(56, 189, 248, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1a1b20',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 10,
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-[var(--glass-border)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16 gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 -ml-2 rounded-xl text-[var(--text-muted)] hover:text-foreground hover:bg-[var(--glass-bg)] transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <h1 className="text-lg font-bold text-foreground">Analytics</h1>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24">
        {/* Top Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
            <p className="text-[10px] text-[var(--text-faint)] uppercase font-bold tracking-widest mb-1">Total Savings</p>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <span className="text-xl font-bold text-foreground">${data?.totalSavings || '0'}</span>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-4 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
            <p className="text-[10px] text-[var(--text-faint)] uppercase font-bold tracking-widest mb-1">Waste Value</p>
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-500" />
              <span className="text-xl font-bold text-foreground">${data?.wasteValue || '0'}</span>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-4 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
            <p className="text-[10px] text-[var(--text-faint)] uppercase font-bold tracking-widest mb-1">Eco Score</p>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xl font-bold text-foreground">{data?.ecoScore || '0'}</span>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-4 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
            <p className="text-[10px] text-[var(--text-faint)] uppercase font-bold tracking-widest mb-1">Items Used</p>
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-sky-500" />
              <span className="text-xl font-bold text-foreground">{data?.totalConsumed || '0'}</span>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="md:col-span-2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-3xl bg-[#14151a] border border-[var(--glass-border)] shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  Weekly Activity
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-[var(--text-faint)]">Saved ($)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-[10px] text-[var(--text-faint)]">Wasted ($)</span>
                  </div>
                </div>
              </div>
              <div className="h-[250px]">
                <Line data={wasteData} options={chartOptions} />
              </div>
            </motion.div>

            {/* AI Insights */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">AI Predictive Insights</h3>
              </div>
              <div className="space-y-3">
                {data?.insights?.map((insight: string, i: number) => (
                  <div key={i} className="flex gap-3 text-sm text-foreground/70 bg-[var(--glass-bg)] p-3 rounded-xl border border-[var(--glass-border)]">
                    <div className="w-5 h-5 shrink-0 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[10px] text-emerald-500">
                      {i + 1}
                    </div>
                    {insight}
                  </div>
                ))}
                {!data?.insights && (
                  <p className="text-sm text-[var(--text-faint)] italic text-center py-4">Add more data to unlock predictive patterns...</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Side Panels */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-3xl bg-[#14151a] border border-[var(--glass-border)]"
            >
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-6">Inventory Split</h3>
              <div className="h-[200px] flex items-center justify-center">
                <Pie data={categoryData} options={{ ...chartOptions, scales: { x: { display: false }, y: { display: false } } }} />
              </div>
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-faint)]">Food</span>
                  <span className="text-emerald-500 font-bold">{data?.categoryCounts?.food || 0}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-faint)]">Medication</span>
                  <span className="text-rose-500 font-bold">{data?.categoryCounts?.medication || 0}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-faint)]">Household</span>
                  <span className="text-sky-500 font-bold">{data?.categoryCounts?.household || 0}</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-3xl bg-[#14151a] border border-[var(--glass-border)]"
            >
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Top Consumed</h3>
              <div className="space-y-3">
                {data?.topItems?.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-muted)]">{item.name}</span>
                    <span className="text-[10px] font-bold text-[var(--text-faint)] bg-[var(--glass-bg)] px-2 py-0.5 rounded-full">{item.count}x</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
