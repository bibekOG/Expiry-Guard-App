// =============================================
// Expiry Guard — Add Item API Route
// Handles both FormData (receipt) and JSON (voice) requests
// Auto-assigns shelf-life from USDA database
// =============================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()

  if (!claimsData?.claims) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const userId = (claimsData.claims as Record<string, unknown>).sub as string

  // Accept both JSON and FormData
  let itemData: Record<string, any>
  const contentType = request.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    const body = await request.json()
    itemData = {
      user_id: userId,
      name: body.name,
      category: body.category || 'food',
      quantity_amount: Number(body.quantity_amount || 1),
      quantity_unit: body.quantity_unit || 'piece',
      storage_location: body.storage_location || 'pantry',
      expires_at: body.expires_at || null,
      financial_value: body.financial_value ? Number(body.financial_value) : null,
      notes: body.notes || null,
      source: body.source || 'voice',
      status: 'active',
    }
  } else {
    const formData = await request.formData()
    itemData = {
      user_id: userId,
      name: formData.get('name') as string,
      category: (formData.get('category') as string) || 'food',
      quantity_amount: Number(formData.get('quantity_amount') || 1),
      quantity_unit: (formData.get('quantity_unit') as string) || 'piece',
      storage_location: (formData.get('storage_location') as string) || 'pantry',
      expires_at: (formData.get('expires_at') as string) || null,
      financial_value: formData.get('financial_value') ? Number(formData.get('financial_value')) : null,
      notes: (formData.get('notes') as string) || null,
      source: (formData.get('source') as string) || 'ocr',
      status: 'active',
    }
  }

  // Auto-assign shelf-life if no expiry provided
  if (!itemData.expires_at) {
    const { data: shelfDefaults } = await supabase
      .from('shelf_life_defaults')
      .select('name, storage_location, shelf_life_days')

    if (shelfDefaults) {
      const nameLower = itemData.name.toLowerCase().trim()
      const match = shelfDefaults.find(
        (d: any) =>
          (d.name.toLowerCase() === nameLower ||
            nameLower.includes(d.name.toLowerCase()) ||
            d.name.toLowerCase().includes(nameLower)) &&
          d.storage_location === itemData.storage_location
      ) || shelfDefaults.find(
        (d: any) =>
          d.name.toLowerCase() === nameLower ||
          nameLower.includes(d.name.toLowerCase()) ||
          d.name.toLowerCase().includes(nameLower)
      )

      if (match) {
        const expiry = new Date()
        expiry.setDate(expiry.getDate() + match.shelf_life_days)
        itemData.expires_at = expiry.toISOString()
      }
    }
  }

  const { data, error } = await supabase
    .from('items')
    .insert(itemData)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, item: data })
}
