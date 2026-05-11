import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InventoryClient from './InventoryClient'

export default async function InventoryPage() {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()

  if (!claimsData?.claims) {
    redirect('/login')
  }

  // Fetch all items for the current user (active and expiring)
  const { data: items } = await supabase
    .from('items')
    .select('*')
    .order('expires_at', { ascending: true, nullsFirst: false })

  // Extract email from JWT claims
  const userEmail = (claimsData.claims as Record<string, unknown>).email as string ?? 'User'

  return (
    <InventoryClient
      userEmail={userEmail}
      items={items ?? []}
    />
  )
}
