'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function addItem(formData: FormData) {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()

  if (!claimsData?.claims) {
    redirect('/login')
  }

  const userId = claimsData.claims.sub as string

  const name = formData.get('name') as string
  const category = formData.get('category') as string
  const quantityAmount = parseFloat(formData.get('quantity_amount') as string) || 1
  const quantityUnit = formData.get('quantity_unit') as string || 'piece'
  const storageLocation = formData.get('storage_location') as string || 'pantry'
  const expiresAt = formData.get('expires_at') as string || null
  const financialValue = formData.get('financial_value')
    ? parseFloat(formData.get('financial_value') as string)
    : null
  const notes = (formData.get('notes') as string) || null

  if (!name || name.trim() === '') {
    redirect('/add?error=' + encodeURIComponent('Item name is required'))
  }

  const { error } = await supabase.from('items').insert({
    user_id: userId,
    name: name.trim(),
    category,
    quantity_amount: quantityAmount,
    quantity_unit: quantityUnit,
    storage_location: storageLocation,
    expires_at: expiresAt || null,
    financial_value: financialValue,
    notes,
    status: 'active',
  })

  if (error) {
    redirect('/add?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/')
  redirect('/')
}
