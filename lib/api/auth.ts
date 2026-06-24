import { apiRequest } from './client'
import type { User } from './types'

export async function getMe(): Promise<User> {
  return apiRequest<User>('/auth/me')
}
