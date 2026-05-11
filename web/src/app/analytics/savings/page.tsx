'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  PieChart,
  Target,
  Sparkles,
  Loader2,
  Wallet,
  ArrowUpRight,
  ChevronRight,
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
import { Line } from 'react-chartjs-2'
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

export default function SavingsPage() {
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
        <p className="text-sm text-[var(--text-faint)] tracking-widest uppercase font-medium">Calculating Impact...</p>
      </div>
    )
  }

  const savingsTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Money Saved',
        data: [120, 150, 180, 160, 210, data?.totalSavings || 250],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
      }
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
        bodyColor: '#fff',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
      },
    },
    scales: {
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 }, callback: (value: any) => `$${value}` },
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
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Financial Impact</h1>
              <p className="text-sm text-[var(--text-faint)] mt-1">See how much you've saved by reducing waste</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">+12% vs Last Month</span>
          </div>
        </div>

        {/* Big Numbers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Wallet className="w-16 h-16 text-emerald-500" />
            </div>
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2">Total Savings</p>
            <h2 className="text-4xl font-black text-foreground mb-2">${data?.totalSavings || '0'}</h2>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-faint)]">
              <ArrowUpRight className="w-3 h-3 text-emerald-500" />
              <span>Lifetime value saved</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-3xl bg-[var(--glass-bg)] border border-[var(--glass-border)] relative overflow-hidden group"
          >
            <p className="text-xs font-bold text-[var(--text-faint)] uppercase tracking-widest mb-2">Potential Savings</p>
            <h2 className="text-4xl font-black text-foreground/80 mb-2">${(data?.wasteValue || 0) + (data?.totalSavings || 0)}</h2>
            <p className="text-xs text-[var(--text-faint)]">If zero food was wasted</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-3xl bg-[var(--glass-bg)] border border-[var(--glass-border)] relative overflow-hidden group"
          >
            <p className="text-xs font-bold text-red-500/50 uppercase tracking-widest mb-2">Waste Value</p>
            <h2 className="text-4xl font-black text-foreground/80 mb-2">${data?.wasteValue || '0'}</h2>
            <p className="text-xs text-[var(--text-faint)]">Value of items discarded</p>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-3xl bg-[#111218] border border-[var(--glass-border)] shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-emerald-500" />
                  Savings Growth
                </h3>
                <div className="flex gap-2">
                  {['1M', '3M', '6M', '1Y'].map(t => (
                    <button key={t} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${t === '6M' ? 'text-white' : 'bg-[var(--glass-bg)] text-[var(--text-faint)] hover:bg-[var(--glass-bg)]'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-[300px] w-full">
                <Line data={savingsTrendData} options={chartOptions} />
              </div>
            </motion.div>

            {/* Smart Advice */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Smart Financial Insights</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-[var(--glass-bg)] transition-colors cursor-default group">
                  <p className="text-xs text-emerald-500 font-bold mb-1">Top Money Saver</p>
                  <p className="text-sm text-foreground/80">You've saved most on <span className="text-foreground font-bold">Premium Meats</span> this month by using them before expiry.</p>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-[var(--glass-bg)] transition-colors cursor-default">
                  <p className="text-xs text-red-500 font-bold mb-1">Waste Alert</p>
                  <p className="text-sm text-foreground/80">Most of your waste comes from <span className="text-foreground font-bold">Dairy</span>. Consider buying smaller quantities.</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="p-6 rounded-3xl bg-[#111218] border border-[var(--glass-border)]"
            >
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-500" />
                Savings Goals
              </h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--text-muted)]">Monthly Goal</span>
                    <span className="text-foreground font-bold">$300</span>
                  </div>
                  <div className="h-2 w-full bg-[var(--glass-bg)] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '83%' }}
                      className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                    />
                  </div>
                  <p className="text-[10px] text-[var(--text-faint)]">$250 of $300 reached</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--text-muted)]">Waste Reduction</span>
                    <span className="text-foreground font-bold">15%</span>
                  </div>
                  <div className="h-2 w-full bg-[var(--glass-bg)] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '65%' }}
                      className="h-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.3)]"
                    />
                  </div>
                  <p className="text-[10px] text-[var(--text-faint)]">Target: 10% reduction</p>
                </div>
              </div>
              
              <button className="w-full mt-8 py-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] text-xs font-bold text-[var(--text-muted)] hover:bg-[var(--glass-bg)] hover:text-foreground transition-all flex items-center justify-center gap-2">
                Manage Goals
                <ChevronRight className="w-3 h-3" />
              </button>
            </motion.div>

            {/* Recent High-Value Items */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="p-6 rounded-3xl bg-[#111218] border border-[var(--glass-border)]"
            >
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">High Value Saved</h3>
              <div className="space-y-4">
                {[
                  { name: 'Organic Ribeye Steak', val: 45, date: '2 days ago' },
                  { name: 'Imported Cheese Wheel', val: 32, date: '5 days ago' },
                  { name: 'Saffron Threads', val: 28, date: '1 week ago' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-default">
                    <div>
                      <p className="text-xs text-foreground/80 font-medium group-hover:text-emerald-500 transition-colors">{item.name}</p>
                      <p className="text-[10px] text-[var(--text-faint)]">{item.date}</p>
                    </div>
                    <span className="text-xs font-black text-emerald-500">${item.val}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
