import type { UserRole } from './auth.types'

export interface Description {
  description: string
  createdAt: string
  updatedAt: string
}

export interface Product {
  allowNewBidders: boolean
  priceStep: number
  images: string[]
  status: ProductStatus
  seller: {
    id: string
    fullName: string
  }
  description: {
    content: string
  }
  descriptionHistories: Description[]
  id: string
  name: string
  mainImage: string
  currentPrice: number
  buyNowPrice: number
  createdAt: string
  endTime: string
  timeRemaining: number
  startTime?: string
  totalBids: number
  highestBidder: {
    id: string
    fullName: string
  }
  winner?: {
    id: string
    fullName: string
  }
  winnerId?: string
  category: {
    id: string
    name: string
    description?: string
  }
  initialPrice: number
  thumbnails: string[]
  updatedAt: string
}

export interface SearchProductsParams {
  sortBy?: string
  categoryId?: string
  query?: string
  searchType?: string
  limit?: number
  page?: number
}

export type ProductStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED'

export type ProductPermission = {
  canRate: boolean
  reason: string | null

  ratingTarget: UserRole

  productInfo: Record<string, unknown>

  id: string
  name: string
  status: ProductStatus

  seller: {
    id: string
    fullName: string
  } | null

  winner: {
    id: string
    fullName: string
  } | null

  hasAlreadyRated: boolean
  userRole: UserRole
}
