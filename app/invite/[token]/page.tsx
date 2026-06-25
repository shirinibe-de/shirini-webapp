'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth-context'
import { resolveInvite, acceptInvite } from '@/lib/api/invites'
import type { InviteInfo } from '@/lib/api/types'
import { isAuthenticated } from '@/lib/auth-storage'

export default function InvitePage() {
  const router = useRouter()
  const params = useParams()
  const token = typeof params.token === 'string' ? params.token : ''
  const { user, loading } = useAuth()
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null)
  const [loadingInvite, setLoadingInvite] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    loadInviteInfo()
  }, [token])

  async function loadInviteInfo() {
    try {
      setLoadingInvite(true)
      setError(null)
      const info = await resolveInvite(token)
      setInviteInfo(info)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid invite link')
    } finally {
      setLoadingInvite(false)
    }
  }

  async function handleAccept() {
    if (!user) {
      const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true'
      if (useMock) {
        // In mock mode, simulate OAuth by storing a mock token and reloading
        const mockToken = 'mock_jwt_token_' + Math.random().toString(36).substring(7)
        localStorage.setItem('shirini_jwt', mockToken)
        // Hard reload to let AuthProvider mount fresh with the token
        window.location.href = window.location.href
      } else {
        // In real mode, redirect to the actual OAuth endpoint
        const redirectUri = `${window.location.origin}/invite/${token}`
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
        window.location.href = `${apiUrl}/api/v1/auth/google?redirect_uri=${encodeURIComponent(redirectUri)}`
      }
      return
    }

    try {
      setAccepting(true)
      setError(null)
      const result = await acceptInvite(token)
      router.push(`/team/${result.team_id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join team')
    } finally {
      setAccepting(false)
    }
  }

  if (loadingInvite) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading invite...</div>
        </div>
      </div>
    )
  }

  if (error || !inviteInfo) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center max-w-md mx-auto px-6">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Invalid Invite</h1>
          <p className="text-lg text-red-700 mb-8">{error || 'This invite link is not valid'}</p>
          <a
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-md mx-auto px-6 bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Join a Team</h1>
        <h2 className="text-2xl font-semibold text-blue-600 mb-4">{inviteInfo.team_name}</h2>
        <p className="text-gray-600 mb-2">Currency: <strong>{inviteInfo.currency}</strong></p>

        {!loading && !user && (
          <p className="text-sm text-gray-500 mb-6">Sign in with your Google account to join this team</p>
        )}

        {!loading && user && (
          <p className="text-sm text-gray-500 mb-6">
            You're signed in as <strong>{user.name}</strong>
          </p>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <Button
          onClick={handleAccept}
          size="lg"
          loading={accepting}
          className="w-full"
        >
          {!loading && user ? 'Join Team' : 'Sign In & Join Team'}
        </Button>

        <a
          href="/"
          className="block mt-4 text-sm text-gray-600 hover:text-gray-900"
        >
          Back to Home
        </a>
      </div>
    </div>
  )
}
