import { apiRequest } from './client'
import type { Claim, CreateClaimBody, CastVoteBody, VoteResponse } from './types'

export async function getClaims(
  teamId: string,
  status: 'pending' | 'approved' | 'rejected' | 'expired' = 'pending'
): Promise<Claim[]> {
  return apiRequest<Claim[]>(`/teams/${teamId}/claims?status=${status}`)
}

export async function createClaim(teamId: string, body: CreateClaimBody): Promise<Claim> {
  return apiRequest<Claim>(`/teams/${teamId}/claims`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function castVote(claimId: string, body: CastVoteBody): Promise<VoteResponse> {
  return apiRequest<VoteResponse>(`/claims/${claimId}/votes`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
