import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()

  if (!claimsData?.claims) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const userId = (claimsData.claims as Record<string, unknown>).sub as string
  const { names } = await request.json()

  if (!Array.isArray(names) || names.length === 0) {
    return NextResponse.json({ error: 'Missing or invalid names array' }, { status: 400 })
  }

  let updatedCount = 0

  for (const name of names) {
    // Find active items that match the name
    const { data: matchingItems } = await supabase
      .from('items')
      .select('id, name')
      .eq('user_id', userId)
      .in('status', ['active', 'expiring_soon', 'expired'])
      .ilike('name', `%${name}%`) // Case-insensitive fuzzy match
      .order('expires_at', { ascending: true }) // Expiring soonest first
      .limit(1)

    if (matchingItems && matchingItems.length > 0) {
      // Mark it as consumed
      const itemId = matchingItems[0].id
      await supabase
        .from('items')
        .update({ 
          status: 'consumed',
          consumed_at: new Date().toISOString()
        })
        .eq('id', itemId)
        
      updatedCount++
    }
  }

  return NextResponse.json({ success: true, count: updatedCount })
}
