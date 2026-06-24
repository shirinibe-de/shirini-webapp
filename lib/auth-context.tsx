'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User } from './api/types'
import { getMe } from './api/auth'
import { getToken, clearToken } from './auth-storage'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadUser() {
      const token = getToken()
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const userData = await getMe()
        setUser(userData)
        setError(null)
      } catch (err) {
        console.error('Failed to load user:', err)
        setError(err instanceof Error ? err.message : 'Failed to load user')
        clearToken()
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const signOut = () => {
    clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
