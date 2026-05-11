'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

/**
 * Real-time inventory sync across multiple devices/family members.
 * Subscribes to Supabase Realtime on the 'items' table.
 * When any household member adds/updates/deletes an item,
 * all other devices see the change instantly.
 */
export function useRealtimeSync() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('realtime-inventory')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
        },
        (payload) => {
          // Refresh the page data when any item changes
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])
}
