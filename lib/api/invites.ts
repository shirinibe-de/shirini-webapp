import { apiRequest } from './client'
import type { InviteInfo } from './types'

export async function resolveInvite(token: string): Promise<InviteInfo> {
  return apiRequest<InviteInfo>(`/invites/${token}`)
}

export async function acceptInvite(token: string): Promise<{ team_id: string; team_name: string }> {
  return apiRequest<{ team_id: string; team_name: string }>(`/invites/${token}/accept`, {
    method: 'POST',
  })
}
