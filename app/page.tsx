'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/Button'
import { isAuthenticated } from '@/lib/auth-storage'

export default function Home() {
  const router = useRouter()
  const { loading } = useAuth()

  useEffect(() => {
    if (!loading && isAuthenticated()) {
      router.push('/home')
    }
  }, [loading, router])

  const handleSignIn = () => {
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

    if (useMock) {
      // In mock mode, simulate OAuth by storing a mock token
      const mockToken = 'mock_jwt_token_' + Math.random().toString(36).substring(7)
      localStorage.setItem('shirini_jwt', mockToken)
      router.push('/home')
    } else {
      // In real mode, redirect to the actual OAuth endpoint
      const redirectUri = `${window.location.origin}/auth/callback`
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      window.location.href = `${apiUrl}/api/v1/auth/google?redirect_uri=${encodeURIComponent(redirectUri)}`
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-md mx-auto px-6">
        <h1 className="text-5xl font-bold mb-4 text-gray-900">شیرینی بده</h1>
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">Shirini Bede</h2>
        <p className="text-lg text-gray-700 mb-8">
          Track social debts in your team with a democratic claim-and-vote system
        </p>
        <Button
          onClick={handleSignIn}
          size="lg"
          className="w-full"
        >
          Sign in with Google
        </Button>
        <p className="text-sm text-gray-600 mt-8">
          A fun way to remember who owes shirini to the team
        </p>
      </div>
    </div>
  )
}
