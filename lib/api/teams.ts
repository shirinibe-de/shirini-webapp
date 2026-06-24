import { apiRequest } from './client'
import type { Team, TeamWithInvite, TeamDetails, TeamMember, CreateTeamBody } from './types'

export async function getTeams(): Promise<Team[]> {
  return apiRequest<Team[]>('/teams')
}

export async function createTeam(body: CreateTeamBody): Promise<TeamWithInvite> {
  return apiRequest<TeamWithInvite>('/teams', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function getTeamDetails(teamId: string): Promise<TeamDetails> {
  return apiRequest<TeamDetails>(`/teams/${teamId}`)
}

export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  return apiRequest<TeamMember[]>(`/teams/${teamId}/members`)
}
