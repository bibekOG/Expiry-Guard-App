// =============================================
// Expiry Guard — Voice Parse API Route (GROQ)
// Uses Groq (Llama 3) to extract structured data for FREE
// =============================================

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

    const prompt = `You are an intelligent app assistant for an inventory management app called Expiry Guard. 
Extract the user's intent from this voice transcript and return ONLY valid JSON (no markdown, no explanation).

The intent MUST be one of: "ADD", "REMOVE", "NAVIGATE", or "UNKNOWN".

If intent is "ADD", include an "items" array where each item matches:
{
  "name": "string (the item name)",
  "quantity_amount": "number (default 1)",
  "quantity_unit": "string (e.g. piece, kg, liter, pack)",
  "category": "food | medication | household",
  "storage_location": "fridge | freezer | pantry | cabinet (best guess)",
  "financial_value": "number or null"
}

If intent is "REMOVE", include a "remove_items" array containing string names of items the user wants to delete/remove/use.

If intent is "NAVIGATE", include a "route" string. Map the user's request to one of these routes:
- "/" (dashboard/home)
- "/inventory" (inventory, all items)
- "/analytics" (analytics, stats, money saved)
- "/recipes" (recipes, eat this now)
- "/medications" (medications, meds)
- "/scan" (barcode scanner)
- "/receipt" (ocr, smart receipt)

Schema:
{
  "intent": "ADD" | "REMOVE" | "NAVIGATE" | "UNKNOWN",
  "items": [], // only if ADD
  "remove_items": [], // only if REMOVE
  "route": "" // only if NAVIGATE
}

Voice transcript: "${transcript}"

Return ONLY a JSON object matching the schema above.`

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
    const content = data.choices?.[0]?.message?.content || ''
    
    const parsed = JSON.parse(content)

    return NextResponse.json({ success: true, ...parsed })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Parse failed',
      },
      { status: 500 }
    )
  }
}
