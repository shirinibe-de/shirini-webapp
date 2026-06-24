// Mock API handlers
import * as Types from '../types'
import * as db from './db'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

// Auth
export async function handleGetMe(): Promise<Types.User> {
  return db.getCurrentUser()
}

// Teams
export async function handleGetTeams(): Promise<Types.Team[]> {
  const userId = db.CURRENT_USER_ID
  const teamIds = Object.entries(db.MOCK_TEAM_MEMBERS)
    .filter(([, members]) => members.includes(userId))
    .map(([teamId]) => teamId)
  return teamIds.map(id => db.MOCK_TEAMS[id])
}

export async function handleCreateTeam(body: Types.CreateTeamBody): Promise<Types.TeamWithInvite> {
  const teamId = `team-${Math.random().toString(36).substring(7)}`
  const inviteToken = `invite-${Math.random().toString(36).substring(7)}`
  const team: Types.TeamWithInvite = {
    id: teamId,
    name: body.name,
    currency: body.currency,
    invite_token: inviteToken,
    created_at: new Date().toISOString(),
  }
  db.MOCK_TEAMS[teamId] = team
  db.MOCK_TEAM_MEMBERS[teamId] = [db.CURRENT_USER_ID]
  db.MOCK_ACHIEVEMENT_TYPES[teamId] = []
  db.MOCK_SETTLEMENTS[teamId] = {}
  return team
}

export async function handleGetTeamDetails(teamId: string): Promise<Types.TeamDetails> {
  const team = db.MOCK_TEAMS[teamId]
  if (!team) throw new ApiError(404, 'Team not found')
  const memberCount = db.MOCK_TEAM_MEMBERS[teamId]?.length || 0
  return {
    ...team,
    member_count: memberCount,
  }
}

export async function handleGetTeamMembers(teamId: string): Promise<Types.TeamMember[]> {
  const memberIds = db.MOCK_TEAM_MEMBERS[teamId]
  if (!memberIds) throw new ApiError(404, 'Team not found')
  return memberIds.map(id => ({
    ...db.MOCK_USERS[id],
    joined_at: '2024-01-01T00:00:00Z',
  }))
}

// Invites
export async function handleResolveInvite(token: string): Promise<Types.InviteInfo> {
  const team = Object.values(db.MOCK_TEAMS).find(t => t.invite_token === token)
  if (!team) throw new ApiError(404, 'Invite not found')
  return {
    team_id: team.id,
    team_name: team.name,
    currency: team.currency,
  }
}

export async function handleAcceptInvite(token: string): Promise<{ team_id: string; team_name: string }> {
  const team = Object.values(db.MOCK_TEAMS).find(t => t.invite_token === token)
  if (!team) throw new ApiError(404, 'Invite not found')
  const members = db.MOCK_TEAM_MEMBERS[team.id]
  if (!members.includes(db.CURRENT_USER_ID)) {
    members.push(db.CURRENT_USER_ID)
  }
  return {
    team_id: team.id,
    team_name: team.name,
  }
}

// Achievement Types
export async function handleGetAchievementTypes(teamId: string): Promise<Types.AchievementType[]> {
  const team = db.MOCK_TEAMS[teamId]
  if (!team) throw new ApiError(404, 'Team not found')
  return db.MOCK_ACHIEVEMENT_TYPES[teamId] || []
}

export async function handleCreateAchievementType(
  teamId: string,
  body: Types.CreateAchievementTypeBody
): Promise<Types.AchievementType> {
  const team = db.MOCK_TEAMS[teamId]
  if (!team) throw new ApiError(404, 'Team not found')
  const ach: Types.AchievementType = {
    id: `ach-${Math.random().toString(36).substring(7)}`,
    name: body.name,
    created_at: new Date().toISOString(),
  }
  if (!db.MOCK_ACHIEVEMENT_TYPES[teamId]) db.MOCK_ACHIEVEMENT_TYPES[teamId] = []
  db.MOCK_ACHIEVEMENT_TYPES[teamId].push(ach)
  return ach
}

// Claims
export async function handleGetClaims(
  teamId: string,
  status: 'pending' | 'approved' | 'rejected' | 'expired' = 'pending'
): Promise<Types.Claim[]> {
  const team = db.MOCK_TEAMS[teamId]
  if (!team) throw new ApiError(404, 'Team not found')
  return db.MOCK_CLAIMS.filter(c => c.status === status)
}

export async function handleCreateClaim(
  teamId: string,
  body: Types.CreateClaimBody
): Promise<Types.Claim> {
  const team = db.MOCK_TEAMS[teamId]
  if (!team) throw new ApiError(404, 'Team not found')
  if (body.claimed_user_id === db.CURRENT_USER_ID) {
    throw new ApiError(400, 'Cannot claim yourself')
  }
  const claimer = db.MOCK_USERS[db.CURRENT_USER_ID]
  const claimedUser = db.MOCK_USERS[body.claimed_user_id]
  const achievementType = db.MOCK_ACHIEVEMENT_TYPES[teamId]?.find(a => a.id === body.achievement_type_id)
  if (!claimedUser || !achievementType) {
    throw new ApiError(404, 'User or achievement type not found')
  }
  const claim: Types.Claim = {
    id: `claim-${Math.random().toString(36).substring(7)}`,
    claimer,
    claimed_user: claimedUser,
    achievement_type: achievementType,
    quantity: body.quantity,
    status: 'pending',
    votes: { approve: 0, reject: 0, my_vote: null },
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  }
  db.MOCK_CLAIMS.push(claim)
  return claim
}

export async function handleCastVote(claimId: string, body: Types.CastVoteBody): Promise<Types.VoteResponse> {
  const claim = db.MOCK_CLAIMS.find(c => c.id === claimId)
  if (!claim) throw new ApiError(404, 'Claim not found')
  if (claim.status !== 'pending') throw new ApiError(400, 'Claim is not pending')

  if (!db.MOCK_VOTES[claimId]) db.MOCK_VOTES[claimId] = {}
  db.MOCK_VOTES[claimId][db.CURRENT_USER_ID] = body.value

  // Recalculate vote counts
  const votes = db.MOCK_VOTES[claimId]
  const approveCount = Object.values(votes).filter(v => v === 'approve').length
  const rejectCount = Object.values(votes).filter(v => v === 'reject').length
  claim.votes = { approve: approveCount, reject: rejectCount, my_vote: body.value }

  // Check if claim is resolved
  if (approveCount > rejectCount) {
    claim.status = 'approved'
  }

  return {
    claim_id: claimId,
    value: body.value,
    claim_status: claim.status,
  }
}

// Debts
export async function handleGetDebts(teamId: string): Promise<Types.Debt[]> {
  const team = db.MOCK_TEAMS[teamId]
  if (!team) throw new ApiError(404, 'Team not found')
  const memberIds = db.MOCK_TEAM_MEMBERS[teamId] || []
  return memberIds
    .map(userId => ({
      user: db.MOCK_USERS[userId],
      total_debt: db.calculateDebt(teamId, userId),
      currency: team.currency,
    }))
    .sort((a, b) => b.total_debt - a.total_debt)
}

export async function handleCreateSettlement(
  teamId: string,
  body: { debtor_id: string }
): Promise<Types.Settlement> {
  const team = db.MOCK_TEAMS[teamId]
  if (!team) throw new ApiError(404, 'Team not found')
  const previousDebt = db.calculateDebt(teamId, body.debtor_id)
  const settlement: Types.Settlement = {
    debtor_id: body.debtor_id,
    previous_debt: previousDebt,
    settled_at: new Date().toISOString(),
  }
  if (!db.MOCK_SETTLEMENTS[teamId]) db.MOCK_SETTLEMENTS[teamId] = {}
  db.MOCK_SETTLEMENTS[teamId][body.debtor_id] = settlement.settled_at
  return settlement
}
