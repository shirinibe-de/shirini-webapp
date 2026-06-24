import { getToken } from '@/lib/auth-storage'
import * as handlers from './mock/handlers'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

// Parse path and method to route to mock handlers
function getMockHandler(method: string, path: string) {
  // Extract base path and params
  const match = path.match(/^([^?]+)/)
  const basePath = match ? match[1] : path

  if (method === 'GET' && basePath === '/auth/me') {
    return { handler: handlers.handleGetMe, params: [] }
  }

  if (method === 'GET' && basePath === '/teams') {
    return { handler: handlers.handleGetTeams, params: [] }
  }

  if (method === 'POST' && basePath === '/teams') {
    return { handler: handlers.handleCreateTeam, params: [] }
  }

  const teamIdMatch = basePath.match(/^\/teams\/([^/]+)$/)
  if (method === 'GET' && teamIdMatch) {
    return { handler: handlers.handleGetTeamDetails, params: [teamIdMatch[1]] }
  }

  const membersMatch = basePath.match(/^\/teams\/([^/]+)\/members$/)
  if (method === 'GET' && membersMatch) {
    return { handler: handlers.handleGetTeamMembers, params: [membersMatch[1]] }
  }

  const achTypesMatch = basePath.match(/^\/teams\/([^/]+)\/achievement-types$/)
  if (method === 'GET' && achTypesMatch) {
    return { handler: handlers.handleGetAchievementTypes, params: [achTypesMatch[1]] }
  }

  if (method === 'POST' && achTypesMatch) {
    return { handler: handlers.handleCreateAchievementType, params: [achTypesMatch[1]] }
  }

  const claimsMatch = basePath.match(/^\/teams\/([^/]+)\/claims$/)
  if (method === 'GET' && claimsMatch) {
    const status = new URLSearchParams(path.split('?')[1] || '').get('status') || 'pending'
    return { handler: handlers.handleGetClaims, params: [claimsMatch[1], status] }
  }

  if (method === 'POST' && claimsMatch) {
    return { handler: handlers.handleCreateClaim, params: [claimsMatch[1]] }
  }

  const voteMatch = basePath.match(/^\/claims\/([^/]+)\/votes$/)
  if (method === 'POST' && voteMatch) {
    return { handler: handlers.handleCastVote, params: [voteMatch[1]] }
  }

  const debtsMatch = basePath.match(/^\/teams\/([^/]+)\/debts$/)
  if (method === 'GET' && debtsMatch) {
    return { handler: handlers.handleGetDebts, params: [debtsMatch[1]] }
  }

  const settlementsMatch = basePath.match(/^\/teams\/([^/]+)\/settlements$/)
  if (method === 'POST' && settlementsMatch) {
    return { handler: handlers.handleCreateSettlement, params: [settlementsMatch[1]] }
  }

  const inviteResolveMatch = basePath.match(/^\/invites\/([^/]+)$/)
  if (method === 'GET' && inviteResolveMatch) {
    return { handler: handlers.handleResolveInvite, params: [inviteResolveMatch[1]] }
  }

  const inviteAcceptMatch = basePath.match(/^\/invites\/([^/]+)\/accept$/)
  if (method === 'POST' && inviteAcceptMatch) {
    return { handler: handlers.handleAcceptInvite, params: [inviteAcceptMatch[1]] }
  }

  return null
}

async function mockDispatch<T>(method: string, path: string, body?: unknown): Promise<T> {
  const route = getMockHandler(method, path)
  if (!route) {
    throw new ApiError(404, `Mock handler not found for ${method} ${path}`)
  }
  try {
    const result = await (route.handler as any)(...route.params, body)
    return result
  } catch (err) {
    if (err instanceof handlers.ApiError) {
      throw err
    }
    throw new ApiError(500, err instanceof Error ? err.message : 'Unknown error')
  }
}

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const method = options?.method || 'GET'

  if (USE_MOCK) {
    let body: unknown
    if (options?.body) {
      body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body
    }
    return mockDispatch<T>(method, path, body)
  }

  // Real API request
  const token = getToken()
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
  const url = `${baseUrl}/api/v1${path}`

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  if (!res.ok) {
    let errorMessage = res.statusText
    try {
      const body = await res.json()
      errorMessage = body.error || errorMessage
    } catch {
      // ignore
    }
    throw new ApiError(res.status, errorMessage)
  }

  return res.json()
}
