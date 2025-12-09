/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from 'react'

export interface Product {
  priceStep: number
  images: string[]
  status: string
  seller: any
  description: ReactNode
  descriptionHistory: string[]
  id: string
  name: string
  mainImage: string
  currentPrice: number
  buyNowPrice: number
  createdAt: string
  endTime: string
  timeRemaining: number
  totalBids: number
  highestBidder: string | null
  category: {
    id: string
    name: string
  }
  thumbnails: string[]
}

export interface SearchProductsParams {
  sortBy?: string
  categoryId?: string
  query?: string
  searchType?: string
  limit?: number
  page?: number
}
