export const UserRole = {
  Guest: 'GUEST',
  Bidder: 'BIDDER',
  Seller: 'SELLER',
  Admin: 'ADMIN',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  rating?: number
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  // refreshToken is stored in httpOnly cookie, not in client
}

export interface LoginResponse {
  user: User
  accessToken: string
  // refreshToken is set in cookie by backend
}

export interface RegisterResponse {
  email: string
  message?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}
