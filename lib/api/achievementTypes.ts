import { apiRequest } from './client'
import type { AchievementType, CreateAchievementTypeBody } from './types'

export async function getAchievementTypes(teamId: string): Promise<AchievementType[]> {
  return apiRequest<AchievementType[]>(`/teams/${teamId}/achievement-types`)
}

export async function createAchievementType(
  teamId: string,
  body: CreateAchievementTypeBody
): Promise<AchievementType> {
  return apiRequest<AchievementType>(`/teams/${teamId}/achievement-types`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
