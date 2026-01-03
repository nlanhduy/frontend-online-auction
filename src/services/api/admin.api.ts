import { getHeaders, request } from '@/config/api'

import type { APIParams, ApiResponse } from '@/config/api'
export const AdminAPI = {
  getDashboardStats({ options }: APIParams): ApiResponse {
    return request({
      method: 'get',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/admin/dashboard/stats`,
      ...options,
    })
  },
  getDashboardUserGrowth({ options }: APIParams): ApiResponse {
    return request({
      method: 'get',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/admin/dashboard/user-growth`,
      ...options,
    })
  },
  getDashboardAuctionsStats({ options }: APIParams): ApiResponse {
    return request({
      method: 'get',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/admin/dashboard/auction-stats`,
      ...options,
    })
  },
}
