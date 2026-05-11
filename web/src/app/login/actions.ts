'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const location = formData.get('location') as string
  const currency = formData.get('currency') as string

  const { data: signUpData, error } = await supabase.auth.signUp({
    ...data,
    options: {
      data: {
        location: location || 'Global',
        currency: currency || 'USD',
      }
    }
  })

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  // If email confirmation is disabled, a session is returned immediately
  if (signUpData?.session) {
    revalidatePath('/', 'layout')
    redirect('/')
  }

  // Otherwise, email confirmation is required
  revalidatePath('/', 'layout')
  redirect('/login?message=' + encodeURIComponent('Check your email to confirm your account.'))
}

