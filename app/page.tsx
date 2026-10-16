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
    const redirectUri = `${window.location.origin}/auth/callback`
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
    window.location.href = `${apiUrl}/api/v1/auth/google?redirect_uri=${encodeURIComponent(redirectUri)}`
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-indigo-300 animate-pulse">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-7xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 drop-shadow-lg">ShiriniBe-De</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 mx-auto rounded-full blur-sm opacity-70"></div>
        </div>

        <p className="text-xl text-indigo-200 mb-2 leading-relaxed font-medium">
          Track social debts in your team
        </p>
        <p className="text-lg text-indigo-300/80 mb-10">
          with a democratic claim-and-vote system
        </p>

        <Button
          onClick={handleSignIn}
          size="lg"
          className="w-full"
        >
          🔐 Sign in with Google
        </Button>

        <div className="mt-12 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
          <p className="text-sm text-indigo-100 leading-relaxed">
            A fun way to remember who owes <span className="font-semibold text-transparent bg-gradient-to-r from-amber-300 to-pink-300 bg-clip-text">shirini</span> to the team
          </p>
        </div>
      </div>
    </div>
  )
}
