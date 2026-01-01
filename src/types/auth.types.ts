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
  fullName: string
  role: UserRole
  avatar?: string
  rating?: number
  createdAt: string
  positiveRating: number
  negativeRating: number
  profilePicture?: string
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

export const RequestToSellerStatus = {
  Pending: 'PENDING',
  Approved: 'APPROVED',
  Rejected: 'REJECTED',
  Expired: 'EXPIRED',
} as const

export type RequestToSellerStatus =
  (typeof RequestToSellerStatus)[keyof typeof RequestToSellerStatus]
