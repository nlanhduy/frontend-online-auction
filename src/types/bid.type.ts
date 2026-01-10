export type Bid = {
  id: string
  amount: number
  createdAt: string
  rejected: boolean
  isProxy?: boolean
  maxAmount?: number
  user: {
    id: string
    fullName: string
  }
}

export type Bids = Bid[]

export type BidValidationResponse = {
  canBid: boolean
  suggestedAmount?: number
  currentPrice: number
  stepPrice: number
  userRatingScore: number
  userTotalRatings: number
  message: string
  isSeller: boolean
  isBidding: boolean
}

export type CreateBidRequest = {
  productId: string
  amount: number
  isProxy?: boolean
  maxAmount?: number
  confirmed: boolean
}

export type BidHistoryItem = {
  id: string
  amount: number
  createdAt: string
  isProxy?: boolean
  maxAmount?: number
  rejected: boolean
  user: {
    id: string
    fullName: string
  }
  isCurrentUser?: boolean
}

export type UserBidStatus = {
  isWinning: boolean
  currentBid?: {
    id: string
    amount: number
    maxAmount?: number
    isProxy: boolean
  }
  remainingBudget?: number
}

export const BidStatus = {
  NOT_STARTED: 'NOT_STARTED',
  ACTIVE: 'ACTIVE',
  ENDED: 'ENDED',
} as const

export type BidStatus = (typeof BidStatus)[keyof typeof BidStatus]
