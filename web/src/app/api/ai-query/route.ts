// =============================================
// Expiry Guard — AI Query API Route (GROQ)
// Context-aware assistant with inventory + usage patterns
// Supports: "What's in my fridge?", "What's expiring?",
//   "Suggest a recipe", predictive waste patterns, etc.
// =============================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY

export async function POST(request: NextRequest) {
  if (!GROQ_API_KEY || GROQ_API_KEY === 'your-groq-api-key') {
    return NextResponse.json(
      { success: false, error: 'Groq API key not configured' },
      { status: 500 }
    )
  }

  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()

  if (!claimsData?.claims) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 }
    )
  }

  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Missing query' },
        { status: 400 }
      )
    }

    // 1. Current inventory
    const { data: items } = await supabase
      .from('items')
      .select('name, category, quantity_amount, quantity_unit, storage_location, status, expires_at, financial_value')
      .in('status', ['active', 'expiring_soon', 'expired'])
      .order('expires_at', { ascending: true })

    // 2. Usage patterns
    const { data: usageLogs } = await supabase
      .from('usage_log')
      .select('item_name, action, action_date, day_of_week, category, financial_value')
      .order('action_date', { ascending: false })
      .limit(50)

    const today = new Date().toISOString().split('T')[0]

    const systemPrompt = `You are "Guard AI", the friendly and intelligent assistant for Expiry Guard. 
Your goal is to help users manage their food inventory, save money, and reduce waste.
Today's date: ${today}

Current Inventory:
${JSON.stringify(items || [], null, 2)}

Recent Usage History:
${JSON.stringify(usageLogs || [], null, 2)}

Rules:
- Be concise and friendly. Use emojis 🥦🍎✨.
- Always refer to specific items from the inventory provided.
- If suggesting recipes, only use ingredients the user actually has.
- Focus on positive reinforcement ("You've saved $X this week!").
`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.7,
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json({ 
        success: true, 
        response: `AI Error: ${data.error?.message || 'The AI service is temporarily unavailable.'}` 
      })
    }

    const text = data.choices?.[0]?.message?.content || 'I could not process that.'

    return NextResponse.json({ success: true, response: text })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Request failed' },
      { status: 500 }
    )
  }
}
