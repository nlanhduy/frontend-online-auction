import { getHeaders, request } from '@/config/api'

import type { APIParams, ApiResponse } from '@/config/api'

export const ProductAPI = {
  getHomePageProducts({ options }: APIParams): ApiResponse {
    return request({
      method: 'get',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/products/homepage`,
      ...options,
    })
  },
  searchProducts({ options }: APIParams): ApiResponse {
    return request({
      method: 'get',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/products/search`,
      ...options,
    })
  },
  getProductDetail({ options, variables }: APIParams): ApiResponse {
    return request({
      method: 'get',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/products/${variables.productId}`,
      ...options,
    })
  },

  addToWatchList({ options, variables }: APIParams): ApiResponse {
    console.log(getHeaders())
    return request({
      method: 'post',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/favorites`,
      data: { productId: variables.productId },
      ...options,
    })
  },

  removeFromWatchList({ options, variables }: APIParams): ApiResponse {
    return request({
      method: 'delete',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/favorites/${variables.productId}`,
      ...options,
    })
  },

  getWatchList({ options }: APIParams): ApiResponse {
    return request({
      method: 'get',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/favorites`,
      ...options,
    })
  },

  checkExistedItemWatchList({ options, variables }: APIParams): ApiResponse {
    return request({
      method: 'get',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/favorites/check/${variables.productId}`,
      ...options,
    })
  },
}
