import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppLayout from './components/AppLayout'
import Scanner from './components/Scanner'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()

  if (!claimsData?.claims) {
    redirect('/login')
  }

  // Extract email from JWT claims
  const userEmail = (claimsData.claims as Record<string, unknown>).email as string ?? 'User'

  return (
    <AppLayout userEmail={userEmail}>
      <div className="grow flex flex-col max-w-2xl w-full mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-foreground tracking-tight mb-2">
            Add Items
          </h1>
          <p className="text-sm text-[var(--text-faint)] font-medium">
            Scan a barcode to populate your fridge.
          </p>
        </div>

        <Scanner />

        <div className="mt-12 p-6 rounded-3xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
           <h2 className="text-xs font-black text-[var(--text-faint)] uppercase tracking-[0.2em] mb-4">Pro Tips</h2>
           <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-[var(--text-muted)]">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                 <span>Point the camera at any product barcode.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-[var(--text-muted)]">
                 <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                 <span>Scanning auto-calculates estimated shelf life.</span>
              </li>
           </ul>
        </div>
      </div>
    </AppLayout>
  )
}
