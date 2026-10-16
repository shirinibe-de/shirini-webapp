import { getToken } from '@/lib/auth-storage'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
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
