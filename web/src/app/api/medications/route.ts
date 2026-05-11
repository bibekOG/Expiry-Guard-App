// API routes for medications and acknowledgment

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()

  if (!claimsData?.claims) {
    return NextResponse.json({ items: [] }, { status: 401 })
  }

  const { data: items } = await supabase
    .from('items')
    .select('*')
    .eq('category', 'medication')
    .in('status', ['active', 'expiring_soon', 'expired'])
    .order('expires_at', { ascending: true })

  return NextResponse.json({ items: items || [] })
}
