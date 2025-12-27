/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Description {
  description: string
  createdAt: string
  updatedAt: string
}

export interface Product {
  priceStep: number
  images: string[]
  status: ProductStatus
  seller: any
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
  highestBidder: string | null
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
