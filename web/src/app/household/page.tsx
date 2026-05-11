'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Users,
  Plus,
  UserPlus,
  Shield,
  Copy,
  Check,
  LogOut,
  Trash2,
  Loader2,
  Home,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Household, HouseholdMember } from '@/lib/types'

export default function HouseholdPage() {
  const router = useRouter()
  const supabase = createClient()
  const [households, setHouseholds] = useState<Household[]>([])
  const [members, setMembers] = useState<Record<string, HouseholdMember[]>>({})
  const [userEmails, setUserEmails] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [newHouseholdName, setNewHouseholdName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadHouseholds()
  }, [])

  async function loadHouseholds() {
    setIsLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Fetch households user belongs to
      const { data: memberOf, error: memberError } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('user_id', user.id)

      if (memberError) throw memberError

      if (memberOf && memberOf.length > 0) {
        const householdIds = memberOf.map(m => m.household_id)
        const { data: householdData, error: hError } = await supabase
          .from('households')
          .select('*')
          .in('id', householdIds)

        if (hError) throw hError
        setHouseholds(householdData || [])

        // Fetch members for each household
        const memberData: Record<string, HouseholdMember[]> = {}
        const allUserIds = new Set<string>()
        
        for (const hId of householdIds) {
          const { data: mData } = await supabase
            .from('household_members')
            .select('*')
            .eq('household_id', hId)
          if (mData) {
            memberData[hId] = mData
            mData.forEach(m => allUserIds.add(m.user_id))
          }
        }
        setMembers(memberData)

        // Fetch emails for all members
        if (allUserIds.size > 0) {
          const { data: emailData, error: emailError } = await supabase.rpc('get_user_emails', {
            user_ids: Array.from(allUserIds)
          })
          if (!emailError && emailData) {
            const emailMap: Record<string, string> = {}
            emailData.forEach((d: any) => {
              emailMap[d.id] = d.email
            })
            setUserEmails(emailMap)
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load households')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateHousehold() {
    if (!newHouseholdName.trim()) return
    setIsCreating(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Create household
      const { data: household, error: hError } = await supabase
        .from('households')
        .insert({
          name: newHouseholdName,
          owner_id: user.id
        })
        .select()
        .single()

      if (hError) throw hError

      // 2. Add owner as member
      const { error: mError } = await supabase
        .from('household_members')
        .insert({
          household_id: household.id,
          user_id: user.id,
          role: 'owner'
        })

      if (mError) throw mError

      setNewHouseholdName('')
      await loadHouseholds()
    } catch (err: any) {
      setError(err.message || 'Failed to create household')
    } finally {
      setIsCreating(false)
    }
  }

  async function handleJoinHousehold() {
    if (!inviteCode.trim()) return
    setIsJoining(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Find household by invite code
      const { data: household, error: hError } = await supabase
        .from('households')
        .select('id')
        .eq('invite_code', inviteCode.trim())
        .single()

      if (hError) throw new Error('Invalid invite code')

      // 2. Check if already a member
      const { data: existing } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('household_id', household.id)
        .eq('user_id', user.id)
        .single()

      if (existing) throw new Error('You are already a member of this household')

      // 3. Join
      const { error: mError } = await supabase
        .from('household_members')
        .insert({
          household_id: household.id,
          user_id: user.id,
          role: 'member'
        })

      if (mError) throw mError

      setInviteCode('')
      await loadHouseholds()
    } catch (err: any) {
      setError(err.message || 'Failed to join household')
    } finally {
      setIsJoining(false)
    }
  }

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(code)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-[var(--glass-border)]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16 gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 -ml-2 rounded-xl text-[var(--text-muted)] hover:text-foreground hover:bg-[var(--glass-bg)] transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                <Users className="w-4 h-4 text-foreground" />
              </div>
              <h1 className="text-lg font-bold text-foreground">Households</h1>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <div className="p-5 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] space-y-4">
            <div className="flex items-center gap-2 text-[var(--text-muted)]">
              <Plus className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-wider">Create New</span>
            </div>
            <input
              type="text"
              placeholder="Household Name"
              value={newHouseholdName}
              onChange={(e) => setNewHouseholdName(e.target.value)}
              className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-foreground placeholdertext-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
            <button
              onClick={handleCreateHousehold}
              disabled={isCreating || !newHouseholdName.trim()}
              className="w-full py-2.5 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Home className="w-4 h-4" />}
              Create Household
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] space-y-4">
            <div className="flex items-center gap-2 text-[var(--text-muted)]">
              <UserPlus className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-wider">Join Existing</span>
            </div>
            <input
              type="text"
              placeholder="Invite Code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-foreground placeholdertext-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
            <button
              onClick={handleJoinHousehold}
              disabled={isJoining || !inviteCode.trim()}
              className="w-full py-2.5 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isJoining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
              Join via Code
            </button>
          </div>
        </div>

        {/* List */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-[var(--text-faint)] uppercase tracking-wider px-1">Your Households</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : households.length === 0 ? (
            <div className="text-center py-10 p-8 rounded-2xl border border-dashed border-[var(--glass-border)]">
              <p className="text-sm text-[var(--text-faint)]">You don't belong to any households yet.</p>
            </div>
          ) : (
            households.map((h) => (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-[var(--glass-border)] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{h.name}</h3>
                    <p className="text-xs text-[var(--text-faint)] mt-1">
                      {members[h.id]?.length || 0} members
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                      <span className="text-xs font-mono text-indigo-500">{h.invite_code}</span>
                      <button 
                        onClick={() => copyInviteCode(h.invite_code)}
                        className="text-[var(--text-faint)] hover:text-foreground transition-colors"
                      >
                        {copiedId === h.invite_code ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {members[h.id]?.map((m) => (
                    <div key={m.user_id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-[var(--text-muted)]">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        <span className="truncate max-w-[200px]" title={userEmails[m.user_id] || m.user_id}>
                          {userEmails[m.user_id] || m.user_id}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tighter ${
                        m.role === 'owner' ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' : 'bg-[var(--glass-bg)] text-[var(--text-faint)] border border-[var(--glass-border)]'
                      }`}>
                        {m.role}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
