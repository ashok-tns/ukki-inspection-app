export interface InspectionBranch {
  id: string
  city: string
}

export interface User {
  id: string
  name: string
  email?: string
  inspectionBranchCity?: InspectionBranch | null
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse extends AuthTokens {
  user: User
}
