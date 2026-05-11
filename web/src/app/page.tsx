import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()

  if (!claimsData?.claims) {
    redirect('/login')
  }

  // Fetch items for the current user
  const { data: items } = await supabase
    .from('items')
    .select('*')
    .order('expires_at', { ascending: true, nullsFirst: false })

  // Extract email from JWT claims
  const userEmail = (claimsData.claims as Record<string, unknown>).email as string ?? 'User'

  return (
    <DashboardClient
      userEmail={userEmail}
      items={items ?? []}
    />
  )
}
