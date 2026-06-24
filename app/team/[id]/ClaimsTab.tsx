'use client'

import { useEffect, useState, useRef } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useAuth } from '@/lib/auth-context'
import { getClaims, createClaim, castVote } from '@/lib/api/claims'
import { getTeamMembers } from '@/lib/api/teams'
import { getAchievementTypes } from '@/lib/api/achievementTypes'
import type { Claim, TeamMember, AchievementType } from '@/lib/api/types'

interface ClaimsTabProps {
  teamId: string
}

export function ClaimsTab({ teamId }: ClaimsTabProps) {
  const { user } = useAuth()
  const [claims, setClaims] = useState<Claim[]>([])
  const [members, setMembers] = useState<TeamMember[]>([])
  const [achievementTypes, setAchievementTypes] = useState<AchievementType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewClaimModal, setShowNewClaimModal] = useState(false)
  const [formData, setFormData] = useState({
    claimed_user_id: '',
    achievement_type_id: '',
    quantity: 1,
  })
  const [creating, setCreating] = useState(false)
  const [voting, setVoting] = useState<Record<string, boolean>>({})
  const [countdowns, setCountdowns] = useState<Record<string, string>>({})
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadData()
  }, [teamId])

  useEffect(() => {
    if (!countdownIntervalRef.current) {
      countdownIntervalRef.current = setInterval(updateCountdowns, 1000)
    }
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }
    }
  }, [claims])

  function updateCountdowns() {
    const newCountdowns: Record<string, string> = {}
    const now = Date.now()

    claims.forEach(claim => {
      const expiresAt = new Date(claim.expires_at).getTime()
      const diff = expiresAt - now

      if (diff <= 0) {
        newCountdowns[claim.id] = 'EXPIRED'
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        newCountdowns[claim.id] = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
          .toString()
          .padStart(2, '0')}`
      }
    })

    setCountdowns(newCountdowns)
  }

  async function loadData() {
    try {
      setLoading(true)
      setError(null)
      const [claimsData, membersData, achievementsData] = await Promise.all([
        getClaims(teamId, 'pending'),
        getTeamMembers(teamId),
        getAchievementTypes(teamId),
      ])
      setClaims(claimsData)
      setMembers(membersData)
      setAchievementTypes(achievementsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load claims')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateClaim(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.claimed_user_id || !formData.achievement_type_id) {
      setError('Please select a member and achievement type')
      return
    }

    try {
      setCreating(true)
      setError(null)
      const newClaim = await createClaim(teamId, {
        claimed_user_id: formData.claimed_user_id,
        achievement_type_id: formData.achievement_type_id,
        quantity: formData.quantity,
      })
      setClaims([newClaim, ...claims])
      setShowNewClaimModal(false)
      setFormData({
        claimed_user_id: '',
        achievement_type_id: '',
        quantity: 1,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create claim')
    } finally {
      setCreating(false)
    }
  }

  async function handleVote(claimId: string, value: 'approve' | 'reject') {
    try {
      setVoting({ ...voting, [claimId]: true })
      setError(null)
      const response = await castVote(claimId, { value })
      setClaims(
        claims.map(c =>
          c.id === claimId
            ? {
                ...c,
                votes: { ...c.votes, my_vote: value },
                status: (response.claim_status as any) || c.status,
              }
            : c
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to vote')
    } finally {
      setVoting({ ...voting, [claimId]: false })
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading claims...</div>
  }

  const userIdForFiltering = user?.id

  return (
    <div>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Pending Claims</h3>
        <Button onClick={() => setShowNewClaimModal(true)}>+ New Claim</Button>
      </div>

      {claims.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">No pending claims yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map(claim => (
            <div key={claim.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar name={claim.claimer.name} avatar_url={claim.claimer.avatar_url} size="sm" />
                    <span className="text-sm text-gray-600">{claim.claimer.name}</span>
                    <span className="text-gray-400">→</span>
                    <Avatar name={claim.claimed_user.name} avatar_url={claim.claimed_user.avatar_url} size="sm" />
                    <span className="text-sm text-gray-600">{claim.claimed_user.name}</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {claim.achievement_type.name} ({claim.quantity}x)
                  </p>
                </div>
                <Badge status={claim.status} />
              </div>

              <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded">
                <div className="flex gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Approve</p>
                    <p className="text-lg font-semibold text-green-600">{claim.votes.approve}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Reject</p>
                    <p className="text-lg font-semibold text-red-600">{claim.votes.reject}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Time remaining</p>
                  <p className="text-lg font-mono text-gray-900">{countdowns[claim.id] || '...'}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant={claim.votes.my_vote === 'approve' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleVote(claim.id, 'approve')}
                  loading={voting[claim.id]}
                  disabled={voting[claim.id] || claim.claimer.id === userIdForFiltering}
                >
                  👍 Approve
                </Button>
                <Button
                  variant={claim.votes.my_vote === 'reject' ? 'danger' : 'secondary'}
                  size="sm"
                  onClick={() => handleVote(claim.id, 'reject')}
                  loading={voting[claim.id]}
                  disabled={voting[claim.id] || claim.claimer.id === userIdForFiltering}
                >
                  👎 Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showNewClaimModal}
        onClose={() => setShowNewClaimModal(false)}
        title="Make a New Claim"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowNewClaimModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateClaim} loading={creating}>
              Create Claim
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateClaim} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Member</label>
            <select
              value={formData.claimed_user_id}
              onChange={(e) => setFormData({ ...formData, claimed_user_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a member...</option>
              {members
                .filter(m => m.id !== user?.id)
                .map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Achievement Type</label>
            <select
              value={formData.achievement_type_id}
              onChange={(e) => setFormData({ ...formData, achievement_type_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select an achievement...</option>
              {achievementTypes.map(ach => (
                <option key={ach.id} value={ach.id}>
                  {ach.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>
      </Modal>
    </div>
  )
}
