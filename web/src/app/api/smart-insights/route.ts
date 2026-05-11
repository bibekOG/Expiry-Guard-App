// =============================================
// Expiry Guard — Smart Insights API
// Proactively analyzes inventory and usage patterns
// to surface actionable intelligence on the dashboard
// =============================================

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY

export async function GET() {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()

  if (!claimsData?.claims) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
  }

  try {
    // Fetch inventory
    const { data: items } = await supabase
      .from('items')
      .select('name, category, quantity_amount, quantity_unit, storage_location, status, expires_at, financial_value')
      .in('status', ['active', 'expiring_soon', 'expired'])
      .order('expires_at', { ascending: true })

    // Fetch usage logs for patterns
    const { data: usageLogs } = await supabase
      .from('usage_log')
      .select('item_name, action, action_date, day_of_week, category, financial_value')
      .order('action_date', { ascending: false })
      .limit(200)

    const today = new Date()
    const in24h = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    const in48h = new Date(today.getTime() + 48 * 60 * 60 * 1000)
    const in72h = new Date(today.getTime() + 72 * 60 * 60 * 1000)

    type Insight = {
      type: 'expiry_warning' | 'meal_suggestion' | 'pattern' | 'tip'
      title: string
      body: string
      urgency: 'high' | 'medium' | 'low'
      items?: string[]
    }

    const insights: Insight[] = []

    // --- DETERMINISTIC INSIGHTS (no AI needed) ---

    // 1. Items expiring within 24 hours
    const expiringToday = items?.filter((i) => {
      if (!i.expires_at) return false
      const exp = new Date(i.expires_at)
      return exp >= today && exp <= in24h
    }) || []

    if (expiringToday.length > 0) {
      insights.push({
        type: 'expiry_warning',
        title: `⚠️ ${expiringToday.length} item${expiringToday.length > 1 ? 's' : ''} expiring TODAY`,
        body: `Use ${expiringToday.length > 1 ? 'these' : 'this'} before ${in24h.toLocaleDateString()} or they'll go to waste!`,
        urgency: 'high',
        items: expiringToday.map((i) => i.name),
      })
    }

    // 2. Items expiring within 48 hours
    const expiring48h = items?.filter((i) => {
      if (!i.expires_at) return false
      const exp = new Date(i.expires_at)
      return exp > in24h && exp <= in48h
    }) || []

    if (expiring48h.length > 0) {
      insights.push({
        type: 'expiry_warning',
        title: `🕐 ${expiring48h.length} item${expiring48h.length > 1 ? 's' : ''} expiring tomorrow`,
        body: 'Plan a meal with these ingredients to avoid waste.',
        urgency: 'medium',
        items: expiring48h.map((i) => i.name),
      })
    }

    // 3. Already expired (pending review)
    const expiredItems = items?.filter((i) => {
      if (!i.expires_at) return false
      return new Date(i.expires_at) < today
    }) || []

    if (expiredItems.length > 0) {
      insights.push({
        type: 'expiry_warning',
        title: `🔴 ${expiredItems.length} expired item${expiredItems.length > 1 ? 's' : ''} need review`,
        body: 'Please check and mark these as consumed or discarded.',
        urgency: 'high',
        items: expiredItems.map((i) => i.name),
      })
    }

    // 4. Meal suggestion for soon-expiring items
    const soonExpiring = [...expiringToday, ...expiring48h]
    if (soonExpiring.length >= 2) {
      const foodItems = soonExpiring.filter((i) => i.category === 'food')
      if (foodItems.length >= 2) {
        insights.push({
          type: 'meal_suggestion',
          title: '🍳 Cook a meal with expiring items!',
          body: `You have ${foodItems.length} food items expiring soon. Tap below to find recipes using these ingredients.`,
          urgency: 'medium',
          items: foodItems.map((i) => i.name),
        })
      }
    }

    // --- AI-POWERED INSIGHTS (patterns & predictions) ---
    if (GROQ_API_KEY && GROQ_API_KEY !== 'your-groq-api-key' && usageLogs && usageLogs.length > 10) {
      try {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const wasteByDay: Record<string, number> = {}
        const wasteByItem: Record<string, number> = {}

        usageLogs.filter((l) => l.action === 'discarded').forEach((l) => {
          const day = dayNames[l.day_of_week]
          wasteByDay[day] = (wasteByDay[day] || 0) + 1
          wasteByItem[l.item_name] = (wasteByItem[l.item_name] || 0) + 1
        })

        const prompt = `You are analyzing a user's food inventory usage patterns. Based on this data, generate 1-2 short, specific, actionable insights.

Current day: ${dayNames[today.getDay()]}
Waste by day of week: ${JSON.stringify(wasteByDay)}
Most wasted items: ${JSON.stringify(Object.entries(wasteByItem).sort((a, b) => b[1] - a[1]).slice(0, 5))}
Items currently expiring in next 72h: ${soonExpiring.map((i) => i.name).join(', ')}
Total consumed: ${usageLogs.filter((l) => l.action === 'consumed').length}
Total discarded: ${usageLogs.filter((l) => l.action === 'discarded').length}

Return ONLY a JSON object with an "insights" array. Each insight has:
- "title": short headline (include an emoji)
- "body": 1-2 sentence actionable advice
- "type": "pattern" or "tip"

Example: {"insights": [{"title": "📊 You waste bread on Thursdays", "body": "Consider buying smaller loaves or freezing half.", "type": "pattern"}]}`

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            max_tokens: 512,
            response_format: { type: 'json_object' },
          }),
        })

        if (res.ok) {
          const data = await res.json()
          const text = data.choices?.[0]?.message?.content || ''
          const parsed = JSON.parse(text)
          const aiInsights = parsed.insights || []
          
          aiInsights.forEach((ai: any) => {
            insights.push({
              type: ai.type === 'pattern' ? 'pattern' : 'tip',
              title: ai.title,
              body: ai.body,
              urgency: 'low',
            })
          })
        }
      } catch (e) {
        // AI insights are optional — fail silently
        console.error('AI insight generation failed:', e)
      }
    }

    return NextResponse.json({ success: true, insights })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to generate insights' }, { status: 500 })
  }
}
