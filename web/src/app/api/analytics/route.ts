// Analytics API Route for Expiry Guard

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Groq API key loaded in the insights section below

export async function GET() {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()

  if (!claimsData?.claims) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const userId = (claimsData.claims as Record<string, unknown>).sub as string

  try {
    // 1. Fetch usage logs for trends
    const { data: logs } = await supabase
      .from('usage_log')
      .select('*')
      .eq('user_id', userId)
      .order('action_date', { ascending: false })

    // 2. Fetch current inventory for counts
    const { data: items } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', userId)

    // Compute trends (last 7 days of activity)
    const consumptionTrend = [0, 0, 0, 0, 0, 0, 0] // Mon-Sun
    const wasteTrend = [0, 0, 0, 0, 0, 0, 0]       // Mon-Sun
    let totalSavings = 0
    let wasteValue = 0
    let totalConsumed = 0

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    logs?.forEach(log => {
      const logValue = Number(log.financial_value || 0)
      const logDate = new Date(log.action_date)
      
      // Totals (all time)
      if (log.action === 'consumed') {
        totalConsumed++
        totalSavings += logValue
      } else {
        wasteValue += logValue
      }

      // Trends (last 7 days)
      if (logDate >= sevenDaysAgo) {
        // day_of_week: 0=Sun, 1=Mon, ..., 6=Sat
        // UI order: 0=Mon, 1=Tue, ..., 5=Sat, 6=Sun
        let uiIndex = log.day_of_week - 1
        if (uiIndex === -1) uiIndex = 6 // Sunday becomes 6
        
        if (log.action === 'consumed') {
          consumptionTrend[uiIndex] += logValue
        } else {
          wasteTrend[uiIndex] += logValue
        }
      }
    })

    // Category counts
    const categoryCounts: Record<string, number> = { food: 0, medication: 0, household: 0 }
    items?.forEach(item => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1
    })

    // Top items
    const itemFreq: Record<string, number> = {}
    logs?.filter(l => l.action === 'consumed').forEach(l => {
      itemFreq[l.item_name] = (itemFreq[l.item_name] || 0) + 1
    })
    const topItems = Object.entries(itemFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    // AI Insights (using Groq for free)
    let insights = [
      "You tend to consume more items on weekends.",
      "Most of your waste comes from the 'Food' category.",
      "You've saved 15% more this month compared to last month."
    ]

    const GROQ_API_KEY = process.env.GROQ_API_KEY
    if (GROQ_API_KEY && GROQ_API_KEY !== 'your-groq-api-key' && logs && logs.length > 5) {
      try {
        const prompt = `Analyze this usage data for a grocery tracker and provide 3 short, actionable insights.
        Focus on reducing waste and saving money. Return ONLY a JSON array of strings.
        Data: ${JSON.stringify(logs.slice(0, 20))}`

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.1,
            response_format: { type: 'json_object' },
          }),
        })
        const groqData = await res.json()
        const text = groqData.choices?.[0]?.message?.content || ''
        const match = text.match(/\[[\s\S]*\]/)
        if (match) insights = JSON.parse(match[0])
        else if (JSON.parse(text).insights) insights = JSON.parse(text).insights
      } catch (e) {
        console.error("AI Insight failed", e)
      }
    }

    return NextResponse.json({
      consumptionTrend,
      wasteTrend,
      totalSavings,
      wasteValue,
      totalConsumed,
      ecoScore: Math.round((totalConsumed / (totalConsumed + (logs?.filter(l => l.action === 'discarded').length || 0) || 1)) * 100),
      categoryCounts,
      categorySplit: [categoryCounts.food, categoryCounts.medication, categoryCounts.household],
      topItems,
      insights
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
