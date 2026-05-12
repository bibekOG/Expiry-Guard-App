import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GraveyardClient from './GraveyardClient'

export default async function GraveyardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch non-active items (consumed, discarded, expired)
  const { data: items } = await supabase
    .from('items')
    .select('*')
    .in('status', ['consumed', 'discarded', 'expired'])
    .order('updated_at', { ascending: false })

  // Fetch user profile for currency
  const { data: profile } = await supabase
    .from('profiles')
    .select('currency, location')
    .eq('id', user.id)
    .single()

  return (
    <GraveyardClient
      userEmail={user.email ?? ''}
      items={items ?? []}
      currency={profile?.currency ?? 'USD'}
      location={profile?.location ?? ''}
    />
  )
}
