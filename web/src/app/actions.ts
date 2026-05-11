'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ItemStatus } from '@/lib/types'

export async function updateItemStatus(itemId: string, status: ItemStatus) {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()

  if (!claimsData?.claims) {
    return { error: 'Not authenticated' }
  }

  const userId = (claimsData.claims as Record<string, unknown>).sub as string
  const updateData: Record<string, unknown> = { status }

  // If marking as consumed/discarded, set consumed_at timestamp
  if (status === 'consumed' || status === 'discarded') {
    updateData.consumed_at = new Date().toISOString()
  }

  // 1. Get item details for logging BEFORE update
  const { data: item } = await supabase
    .from('items')
    .select('name, category, financial_value')
    .eq('id', itemId)
    .single()

  // 2. Perform update
  const { error } = await supabase
    .from('items')
    .update(updateData)
    .eq('id', itemId)

  if (error) {
    return { error: error.message }
  }

  // 3. Log usage if consumed/discarded
  if ((status === 'consumed' || status === 'discarded') && item) {
    await supabase.from('usage_log').insert({
      user_id: userId,
      item_name: item.name,
      action: status as 'consumed' | 'discarded',
      category: item.category,
      financial_value: item.financial_value,
      day_of_week: new Date().getDay(),
    })
  }

  revalidatePath('/')
  return { success: true }
}

export async function deleteItem(itemId: string) {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()

  if (!claimsData?.claims) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', itemId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}
