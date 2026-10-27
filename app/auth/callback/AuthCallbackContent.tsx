
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { setToken } from '@/lib/auth-storage'

export function AuthCallbackContent() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = searchParams.get('token')
    const errorMsg = searchParams.get('error')

    if (errorMsg) {
      setError(errorMsg)
      return
    }

    if (!token) {
      setError('No token received from authentication')
      return
    }

    try {
      setToken(token)
      window.location.replace('/home')
    } catch (err) {
      setError('Failed to store authentication token')
    }
  }, [searchParams])

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center max-w-md mx-auto px-6">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">
            Authentication Error
          </h1>
          <p className="text-lg text-red-700 mb-8">{error}</p>
          <a
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Sign In
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-md mx-auto px-6">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">
          Signing you in...
        </h1>
        <div className="animate-pulse">
          <div className="h-2 bg-blue-600 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}
