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
      <div className="flex h-full items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading team...</div>
      </div>
    )
  }

  if (!user || !team) {
    return (
      <div className="min-h-full bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <p className="text-red-600">{error || 'Team not found or access denied'}</p>
          <Button onClick={() => router.push('/home')} className="mt-4">
            Back to Teams
          </Button>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'debts', label: 'Debts' },
    { id: 'claims', label: 'Claims' },
    { id: 'settings', label: 'Settings' },
  ]

  return (
    <div className="min-h-full bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
            <p className="text-gray-600 text-sm">{team.currency} · {team.member_count} members</p>
          </div>
          <Button variant="ghost" onClick={() => router.push('/home')}>
            ← Back to Teams
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <TabBar tabs={tabs} activeTabId={activeTab} onTabChange={setActiveTab} />

          <div className="p-6">
            {activeTab === 'debts' && <DebtsTab teamId={teamId} currency={team.currency} />}
            {activeTab === 'claims' && <ClaimsTab teamId={teamId} />}
            {activeTab === 'settings' && <SettingsTab teamId={teamId} team={team} />}
          </div>
        </div>
      </main>
    </div>
  )
}
