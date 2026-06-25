'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { TabBar } from '@/components/ui/TabBar'
import { useAuth } from '@/lib/auth-context'
import { getTeamDetails } from '@/lib/api/teams'
import type { TeamDetails } from '@/lib/api/types'
import { DebtsTab } from './DebtsTab'
import { ClaimsTab } from './ClaimsTab'
import { SettingsTab } from './SettingsTab'

interface TeamPageProps {
  teamId: string
}

export function TeamPage({ teamId }: TeamPageProps) {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [team, setTeam] = useState<TeamDetails | null>(null)
  const [loadingTeam, setLoadingTeam] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('debts')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (user) {
      loadTeam()
    }
  }, [user, teamId])

  async function loadTeam() {
    try {
      setLoadingTeam(true)
      setError(null)
      const data = await getTeamDetails(teamId)
      setTeam(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load team')
    } finally {
      setLoadingTeam(false)
    }
  }

  if (loading || loadingTeam) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="text-3xl text-indigo-400 animate-spin mb-4">⏳</div>
          <div className="text-indigo-300/80">Loading team...</div>
        </div>
      </div>
    )
  }

  if (!user || !team) {
    return (
      <div className="min-h-full">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-red-300 text-lg font-semibold mb-6">{error || 'Team not found or access denied'}</p>
          <Button onClick={() => router.push('/home')}>
            ← Back to Teams
          </Button>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'debts', label: '💳 Debts' },
    { id: 'claims', label: '📝 Claims' },
    { id: 'settings', label: '⚙️ Settings' },
  ]

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/10 border-b border-white/20 rounded-b-2xl">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">{team.name}</h1>
            <p className="text-indigo-200 text-sm mt-1">💱 {team.currency} • 👥 {team.member_count} members</p>
          </div>
          <Button variant="ghost" onClick={() => router.push('/home')}>
            ← Back to Teams
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 backdrop-blur-md bg-red-500/20 border border-red-400/40 rounded-xl text-red-200 flex items-start gap-3">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl overflow-hidden">
          <TabBar tabs={tabs} activeTabId={activeTab} onTabChange={setActiveTab} />

          <div className="p-8">
            {activeTab === 'debts' && <DebtsTab teamId={teamId} currency={team.currency} />}
            {activeTab === 'claims' && <ClaimsTab teamId={teamId} />}
            {activeTab === 'settings' && <SettingsTab teamId={teamId} team={team} />}
          </div>
        </div>
      </main>
    </div>
  )
}
