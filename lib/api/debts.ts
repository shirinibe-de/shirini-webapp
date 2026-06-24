import { apiRequest } from './client'
import type { Debt, Settlement, CreateSettlementBody } from './types'

export async function getDebts(teamId: string): Promise<Debt[]> {
  return apiRequest<Debt[]>(`/teams/${teamId}/debts`)
}

export async function createSettlement(teamId: string, body: CreateSettlementBody): Promise<Settlement> {
  return apiRequest<Settlement>(`/teams/${teamId}/settlements`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
