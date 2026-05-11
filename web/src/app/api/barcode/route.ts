// =============================================
// Expiry Guard — Barcode Lookup API Route
// Proxies Open Food Facts to avoid CORS issues
// =============================================

import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory cache to avoid redundant API calls
const cache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 1000 * 60 * 60 // 1 hour

export async function GET(request: NextRequest) {
  const barcode = request.nextUrl.searchParams.get('code')

  if (!barcode) {
    return NextResponse.json(
      { success: false, error: 'Missing barcode parameter' },
      { status: 400 }
    )
  }

  // Check cache
  const cached = cache.get(barcode)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data)
  }

  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
      {
        headers: {
          'User-Agent': 'ExpiryGuard/1.0 (contact@expiryguard.app)',
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    const data = await response.json()

    if (data.status !== 1) {
      return NextResponse.json(
        { success: false, error: 'Product not in database' },
        { status: 404 }
      )
    }

    const product = data.product || {}
    const result = {
      success: true,
      name: product.product_name || 'Unknown Product',
      categories: product.categories || '',
      image_url: product.image_url || null,
      brands: product.brands || null,
      quantity: product.quantity || null,
    }

    // Store in cache
    cache.set(barcode, { data: result, timestamp: Date.now() })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch',
      },
      { status: 500 }
    )
  }
}
