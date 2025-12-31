// src/services/auth.ts
import { getHeaders, request } from '@/config/api'

import type { APIParams, ApiResponse } from '@/config/api'

export const BidAPI = {
  getProductBidHistory({ options, variables }: APIParams): ApiResponse {
    return request({
      method: 'get',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/bids/history/${variables.productId}`,
      ...options,
    })
  },
  placeBid({ options }: APIParams): ApiResponse {
    return request({
      method: 'post',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/bids`,
      ...options,
    })
  },
}
