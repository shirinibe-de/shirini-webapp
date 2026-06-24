'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useAuth } from '@/lib/auth-context'
import { getTeams, createTeam } from '@/lib/api/teams'
import type { Team } from '@/lib/api/types'

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [loadingTeams, setLoadingTeams] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({ name: '', currency: '' })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (user) {
      loadTeams()
    }
  }, [user])

  async function loadTeams() {
    try {
      setLoadingTeams(true)
      setError(null)
      const data = await getTeams()
      setTeams(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load teams')
    } finally {
      setLoadingTeams(false)
    }
  }

  async function handleCreateTeam(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name || !formData.currency) {
      setError('Please fill in all fields')
      return
    }

    try {
      setCreating(true)
      setError(null)
      const newTeam = await createTeam({ name: formData.name, currency: formData.currency })
      setTeams([...teams, newTeam])
      setShowCreateModal(false)
      setFormData({ name: '', currency: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team')
    } finally {
      setCreating(false)
    }
  }

  function copyInviteLink(teamId: string, inviteToken: string) {
    const link = `${window.location.origin}/invite/${inviteToken}`
    navigator.clipboard.writeText(link)
    alert('Invite link copied!')
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-full bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">شیرینی بده</h1>
            <p className="text-gray-600 text-sm">Welcome, {user.name}!</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              localStorage.removeItem('shirini_jwt')
              router.push('/')
            }}
          >
            Sign Out
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">Your Teams</h2>
          <Button onClick={() => setShowCreateModal(true)}>Create Team</Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {loadingTeams ? (
          <div className="text-center py-12 text-gray-600">Loading teams...</div>
        ) : teams.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600 mb-6">You're not in any teams yet</p>
            <p className="text-sm text-gray-500 mb-6">
              Create a team to get started or ask a teammate for an invite link
            </p>
            <Button onClick={() => setShowCreateModal(true)}>Create Your First Team</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <div
                key={team.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/team/${team.id}`)}
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{team.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">Currency: {team.currency}</p>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" className="flex-1" onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/team/${team.id}`)
                    }}>
                      View Team
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        const inviteToken = team.id
                        copyInviteLink(team.id, inviteToken)
                      }}
                    >
                      📋 Copy Invite
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create a New Team"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTeam} loading={creating}>
              Create Team
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Backend Squad"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency Unit</label>
            <input
              type="text"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., slice of pizza"
            />
          </div>
        </form>
      </Modal>
    </div>
  )
}
