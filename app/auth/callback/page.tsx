'use client'

import { Suspense } from 'react'
import { AuthCallbackContent } from './AuthCallbackContent'

export default function AuthCallback() {
  return (
    <Suspense fallback={<AuthCallbackLoading />}>
      <AuthCallbackContent />
    </Suspense>
  )
}

function AuthCallbackLoading() {
  return (
    <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-md mx-auto px-6">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Signing you in...</h1>
        <div className="animate-pulse">
          <div className="h-2 bg-blue-600 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}
