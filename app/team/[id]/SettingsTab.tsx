'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { getAchievementTypes, createAchievementType } from '@/lib/api/achievementTypes'
import type { TeamDetails, AchievementType } from '@/lib/api/types'

interface SettingsTabProps {
  teamId: string
  team: TeamDetails
}

export function SettingsTab({ teamId, team }: SettingsTabProps) {
  const [achievementTypes, setAchievementTypes] = useState<AchievementType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newAchievementName, setNewAchievementName] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    loadAchievementTypes()
  }, [teamId])

  async function loadAchievementTypes() {
    try {
      setLoading(true)
      setError(null)
      const data = await getAchievementTypes(teamId)
      setAchievementTypes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load achievement types')
    } finally {
      setLoading(false)
    }
  }

  async function handleAddAchievementType(e: React.FormEvent) {
    e.preventDefault()
    if (!newAchievementName.trim()) {
      setError('Please enter an achievement type name')
      return
    }

    try {
      setAdding(true)
      setError(null)
      const newAch = await createAchievementType(teamId, { name: newAchievementName })
      setAchievementTypes([...achievementTypes, newAch])
      setNewAchievementName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add achievement type')
    } finally {
      setAdding(false)
    }
  }

  function copyInviteLink() {
    const link = `${window.location.origin}/invite/${team.invite_token}`
    navigator.clipboard.writeText(link)
    alert('Invite link copied to clipboard!')
  }

  return (
    <div className="space-y-8">
      {/* Team Info */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Team Info</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
            <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-900">
              {team.name}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency Unit</label>
            <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-900">
              {team.currency}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Members</label>
            <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-900">
              {team.member_count} member{team.member_count !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Invite Link */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Invite Link</h3>
        <div className="flex gap-3">
          <input
            type="text"
            readOnly
            value={`${window.location.origin}/invite/${team.invite_token}`}
            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-mono text-sm"
          />
          <Button onClick={copyInviteLink} variant="secondary">
            📋 Copy
          </Button>
        </div>
        <p className="text-sm text-gray-600 mt-2">Share this link with teammates to let them join</p>
      </div>

      {/* Achievement Types */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Achievement Types</h3>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-gray-600">Loading achievement types...</div>
        ) : (
          <>
            {achievementTypes.length > 0 && (
              <div className="mb-6 space-y-2">
                {achievementTypes.map(ach => (
                  <div
                    key={ach.id}
                    className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900"
                  >
                    {ach.name}
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAddAchievementType} className="flex gap-2">
              <input
                type="text"
                value={newAchievementName}
                onChange={(e) => setNewAchievementName(e.target.value)}
                placeholder="e.g., First deploy to production"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button type="submit" loading={adding}>
                Add
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
