// In-memory mock database with realistic seed data
import * as Types from '../types'

// Generate realistic UUIDs
const uuid = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

// Seed data
export const MOCK_USERS: Record<string, Types.User> = {
  'user-1': {
    id: 'user-1',
    email: 'ahmad@example.com',
    name: 'Ahmad',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad',
    created_at: '2024-01-01T00:00:00Z',
  },
  'user-2': {
    id: 'user-2',
    email: 'sara@example.com',
    name: 'Sara',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara',
    created_at: '2024-01-02T00:00:00Z',
  },
  'user-3': {
    id: 'user-3',
    email: 'reza@example.com',
    name: 'Reza',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Reza',
    created_at: '2024-01-03T00:00:00Z',
  },
  'user-4': {
    id: 'user-4',
    email: 'neda@example.com',
    name: 'Neda',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neda',
    created_at: '2024-01-04T00:00:00Z',
  },
  'user-5': {
    id: 'user-5',
    email: 'ali@example.com',
    name: 'Ali',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ali',
    created_at: '2024-01-05T00:00:00Z',
  },
}

export const MOCK_TEAMS: Record<string, Types.TeamWithInvite> = {
  'team-1': {
    id: 'team-1',
    name: 'Backend Squad',
    currency: 'slice of pizza',
    invite_token: 'invite-backend-squad',
    created_at: '2024-01-10T00:00:00Z',
  },
  'team-2': {
    id: 'team-2',
    name: 'Frontend Ninjas',
    currency: 'cup of coffee',
    invite_token: 'invite-frontend-ninjas',
    created_at: '2024-01-15T00:00:00Z',
  },
}

// Team memberships: team_id -> user_id[]
export const MOCK_TEAM_MEMBERS: Record<string, string[]> = {
  'team-1': ['user-1', 'user-2', 'user-3', 'user-5'],
  'team-2': ['user-1', 'user-4'],
}

// Achievement types per team
export const MOCK_ACHIEVEMENT_TYPES: Record<string, Types.AchievementType[]> = {
  'team-1': [
    { id: 'ach-1', name: 'First deploy to production', created_at: '2024-01-10T10:00:00Z' },
    { id: 'ach-2', name: 'Bought a new phone', created_at: '2024-01-12T10:00:00Z' },
    { id: 'ach-3', name: 'Fixed a critical bug', created_at: '2024-01-14T10:00:00Z' },
  ],
  'team-2': [
    { id: 'ach-4', name: 'Shipped a new feature', created_at: '2024-01-15T10:00:00Z' },
    { id: 'ach-5', name: 'Promoted to Senior', created_at: '2024-01-16T10:00:00Z' },
  ],
}

// Claims: stored as a mutable list
export let MOCK_CLAIMS: Types.Claim[] = [
  {
    id: 'claim-1',
    claimer: MOCK_USERS['user-2'],
    claimed_user: MOCK_USERS['user-1'],
    achievement_type: MOCK_ACHIEVEMENT_TYPES['team-1'][0],
    quantity: 2,
    status: 'pending',
    votes: { approve: 2, reject: 0, my_vote: null },
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'claim-2',
    claimer: MOCK_USERS['user-1'],
    claimed_user: MOCK_USERS['user-3'],
    achievement_type: MOCK_ACHIEVEMENT_TYPES['team-1'][1],
    quantity: 1,
    status: 'pending',
    votes: { approve: 1, reject: 1, my_vote: null },
    expires_at: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'claim-3',
    claimer: MOCK_USERS['user-3'],
    claimed_user: MOCK_USERS['user-5'],
    achievement_type: MOCK_ACHIEVEMENT_TYPES['team-1'][2],
    quantity: 3,
    status: 'approved',
    votes: { approve: 3, reject: 0, my_vote: 'approve' },
    expires_at: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
]

// Votes: claim_id -> user_id -> value
export const MOCK_VOTES: Record<string, Record<string, 'approve' | 'reject'>> = {
  'claim-1': {
    'user-2': 'approve',
    'user-3': 'approve',
  },
  'claim-2': {
    'user-2': 'approve',
    'user-5': 'reject',
  },
  'claim-3': {
    'user-1': 'approve',
    'user-2': 'approve',
    'user-3': 'approve',
  },
}

// Settlements: team_id -> debtor_id -> settled_at timestamp
export const MOCK_SETTLEMENTS: Record<string, Record<string, string>> = {
  'team-1': {},
}

// Current authenticated user (mock)
export let CURRENT_USER_ID = 'user-1'

export function setCurrentUserId(userId: string) {
  CURRENT_USER_ID = userId
}

export function getCurrentUser(): Types.User {
  return MOCK_USERS[CURRENT_USER_ID]
}

export function calculateDebt(teamId: string, userId: string): number {
  const teamClaims = MOCK_CLAIMS.filter(c => c.claimed_user.id === userId && c.status === 'approved')
  const lastSettlement = MOCK_SETTLEMENTS[teamId]?.[userId]
  let debt = 0
  for (const claim of teamClaims) {
    if (!lastSettlement || new Date(claim.created_at) > new Date(lastSettlement)) {
      debt += claim.quantity
    }
  }
  return debt
}
