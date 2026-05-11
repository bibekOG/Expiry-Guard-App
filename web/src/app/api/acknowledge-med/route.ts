// Medication expiry acknowledgment API route

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()

  if (!claimsData?.claims) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { itemId, action } = await request.json()

  if (!itemId || !action) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Update the item status
  const { error } = await supabase
    .from('items')
    .update({
      status: action,
      consumed_at: new Date().toISOString(),
    })
    .eq('id', itemId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log the usage
  const { data: item } = await supabase
    .from('items')
    .select('name, category, financial_value')
    .eq('id', itemId)
    .single()

  if (item) {
    await supabase.from('usage_log').insert({
      user_id: (claimsData.claims as Record<string, unknown>).sub as string,
      item_name: item.name,
      action,
      category: item.category,
      financial_value: item.financial_value,
      day_of_week: new Date().getDay(),
    })
  }

  return NextResponse.json({ success: true })
}
