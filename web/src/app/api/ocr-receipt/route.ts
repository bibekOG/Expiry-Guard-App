// =============================================
// Expiry Guard — Receipt OCR API Route (FREE)
// Uses OCR.space for text extraction + Groq for structuring
// =============================================

import { NextRequest, NextResponse } from 'next/server'

const OCR_SPACE_API_KEY = process.env.OCR_SPACE_API_KEY
const GROQ_API_KEY = process.env.GROQ_API_KEY

export async function POST(request: NextRequest) {
  if (!OCR_SPACE_API_KEY || !GROQ_API_KEY) {
    return NextResponse.json(
      { success: false, error: 'API keys not configured' },
      { status: 500 }
    )
  }

  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Missing image data' },
        { status: 400 }
      )
    }

    // --- STEP 1: Extract text using OCR.space ---
    const ocrFormData = new FormData()
    ocrFormData.append('apikey', OCR_SPACE_API_KEY)
    ocrFormData.append('base64Image', image)
    ocrFormData.append('isOverlayRequired', 'false')
    ocrFormData.append('filetype', 'jpg')

    const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: ocrFormData,
    })

    const ocrResult = await ocrResponse.json()
    if (ocrResult.OCRExitCode !== 1) {
      return NextResponse.json(
        { success: false, error: `OCR error: ${ocrResult.ErrorMessage?.[0] || 'Unknown'}` },
        { status: 500 }
      )
    }

    const rawText = ocrResult.ParsedResults?.[0]?.ParsedText || ''
    if (!rawText.trim()) {
      return NextResponse.json(
        { success: false, error: 'No text found in image' },
        { status: 400 }
      )
    }

    // --- STEP 2: Structure text using Groq ---
    const prompt = `Analyze this raw text from a grocery receipt. Extract each purchased item as a JSON array.

Raw text: "${rawText}"

For each item, provide:
{
  "name": "string (clean product name, no abbreviations)",
  "quantity_amount": "number (quantity purchased, default 1)",
  "quantity_unit": "string (piece, kg, lb, etc.)",
  "category": "food | medication | household",
  "financial_value": "number (price paid, or null if unclear)",
  "storage_location": "fridge | freezer | pantry | cabinet (best guess based on item type)"
}

Rules:
- Ignore store name, address, tax, totals, etc.
- Clean up abbreviated names.
- Return ONLY a valid JSON array.`

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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

    const groqData = await groqResponse.json()
    const content = groqData.choices?.[0]?.message?.content || '[]'
    
    let items = JSON.parse(content)
    if (!Array.isArray(items) && items.items) {
      items = items.items
    }

    return NextResponse.json({ success: true, items: Array.isArray(items) ? items : [items] })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'OCR processing failed',
      },
      { status: 500 }
    )
  }
}
