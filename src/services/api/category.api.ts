import { getHeaders, request } from '@/config/api'

import type { APIParams, ApiResponse } from '@/config/api'

export const CategoryAPI = {
  getAllCategories({ options }: APIParams): ApiResponse {
    return request({
      method: 'get',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/categories`,
      ...options,
    })
  },
}
