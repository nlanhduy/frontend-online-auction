export const UserRole = {
  Guest: 'guest',
  Bidder: 'bidder',
  Seller: 'seller',
  Admin: 'admin',
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
  // TODO: Check schema of user
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (user: User, tokens: { accessToken: string; refreshToken: string }) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}
