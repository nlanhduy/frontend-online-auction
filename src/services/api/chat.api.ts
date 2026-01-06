import { getHeaders, request } from '@/config/api'

import type { APIParams, ApiResponse } from '@/config/api'
export const ChatAPI = {
  getMessages({ options, variables }: APIParams): ApiResponse {
    return request({
      method: 'get',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/chat/order/${variables.orderId}/messages`,
      ...options,
    })
  },
  sendMessage({ options, variables }: APIParams): ApiResponse {
    return request({
      method: 'post',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/chat/order/${variables.orderId}/messages`,
      ...options,
    })
  },
  markAsRead({ options, variables }: APIParams): ApiResponse {
    return request({
      method: 'post',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/chat/order/${variables.orderId}/mark-read`,
      ...options,
    })
  },
  getUnreadCount({ options, variables }: APIParams): ApiResponse {
    return request({
      method: 'get',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/chat/order/${variables.orderId}/unread-count`,
      ...options,
    })
  },
}
