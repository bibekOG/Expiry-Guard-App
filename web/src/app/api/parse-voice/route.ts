import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY

export async function POST(request: NextRequest) {
  if (!GROQ_API_KEY || GROQ_API_KEY === 'your-groq-api-key') {
    return NextResponse.json(
      { success: false, error: 'Groq API key not configured' },
      { status: 500 }
    )
  }

  try {
    const { transcript } = await request.json()

    if (!transcript) {
      return NextResponse.json(
        { success: false, error: 'Missing transcript' },
        { status: 400 }
      )
    }

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    let userLocation = 'Global'
    let userCurrency = 'USD'
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('location, currency')
        .eq('id', user.id)
        .single()
      
      if (profile) {
        userLocation = profile.location || 'Global'
        userCurrency = profile.currency || 'USD'
      }
    }

    const prompt = `You are an intelligent app assistant for an inventory management app called Expiry Guard. 
The user is located in: ${userLocation}. 
Preferred currency: ${userCurrency}.

Extract the user's intent from this voice transcript and return ONLY valid JSON.

INTENT RULES:
1. ADD: Use when the user says they bought, got, added, or has new items. 
2. REMOVE: Use when the user says they ate, used, finished, threw away, or want to remove items.
3. NAVIGATE: Use when the user wants to go to a specific page.
4. UNKNOWN: Use for greetings or non-command chatter.

If intent is ADD, include an items array. 
IMPORTANT: If the user doesn't mention a price, ESTIMATE a reasonable market price in ${userCurrency} based on their location (${userLocation}) and put it in financial_value.
{
  "name": "string",
  "quantity_amount": number,
  "quantity_unit": "string",
  "category": "food or medication or household",
  "storage_location": "fridge or freezer or pantry or cabinet",
  "financial_value": number
}

If intent is REMOVE, include a remove_items array of string names.

If intent is NAVIGATE, include a route string.

Schema:
{
  "intent": "ADD", "REMOVE", "NAVIGATE", or "UNKNOWN",
  "items": [],
  "remove_items": [],
  "route": ""
}

Transcript: "${transcript}"`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { success: false, error: `Groq error: ${errorData.error?.message || 'Unknown'}` },
        { status: 500 }
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || '{}'
    const parsed = JSON.parse(content)

    return NextResponse.json({ success: true, ...parsed })
  } catch (error) {
    console.error('Voice parse error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Parse failed',
      },
      { status: 500 }
    )
  }
}
