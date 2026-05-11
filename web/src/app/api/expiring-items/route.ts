// =============================================
// Expiry Guard — Expiring Items API Route
// Returns items expiring within 48 hours for the authenticated user
// =============================================

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()

  if (!claimsData?.claims) {
    return NextResponse.json({ items: [] }, { status: 401 })
  }

  const now = new Date()
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000)

  const { data: items } = await supabase
    .from('items')
    .select('*')
    .in('status', ['active', 'expiring_soon'])
    .lte('expires_at', in48h.toISOString())
    .gte('expires_at', now.toISOString())
    .order('expires_at', { ascending: true })

  return NextResponse.json({ items: items || [] })
}
