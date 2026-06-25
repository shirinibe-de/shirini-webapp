// All domain types for ShiriniBe-De app

export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at?: string
}

export interface Team {
  id: string
  name: string
  currency: string
  created_at?: string
}

export interface TeamWithInvite extends Team {
  invite_token: string
}

export interface TeamDetails extends Team {
  invite_token: string
  member_count: number
}

export interface TeamMember extends User {
  joined_at: string
}

export interface AchievementType {
  id: string
  name: string
  created_at: string
}

export interface Vote {
  approve: number
  reject: number
  my_vote: 'approve' | 'reject' | null
}

export interface Claim {
  id: string
  claimer: User
  claimed_user: User
  achievement_type: AchievementType
  quantity: number
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  votes: Vote
  expires_at: string
  created_at: string
}

export interface VoteResponse {
  claim_id: string
  value: 'approve' | 'reject'
  claim_status: string
}

export interface Debt {
  user: User
  total_debt: number
  currency: string
}

export interface Settlement {
  debtor_id: string
  previous_debt: number
  settled_at: string
}

export interface InviteInfo {
  team_id: string
  team_name: string
  currency: string
}

// Request/response body types
export interface CreateTeamBody {
  name: string
  currency: string
}

export interface CreateClaimBody {
  claimed_user_id: string
  achievement_type_id: string
  quantity: number
}

export interface CastVoteBody {
  value: 'approve' | 'reject'
}

export interface CreateSettlementBody {
  debtor_id: string
}

export interface CreateAchievementTypeBody {
  name: string
}
