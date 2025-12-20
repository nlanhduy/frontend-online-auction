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
  createCategory({ options }: APIParams): ApiResponse {
    return request({
      method: 'post',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/categories`,
      ...options,
    })
  },
  updateCategory({ options, variables }: APIParams): ApiResponse {
    return request({
      method: 'patch',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/categories/${variables.categoryId}`,
      ...options,
    })
  },
  deleteCategory({ options, variables }: APIParams): ApiResponse {
    return request({
      method: 'delete',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/categories/${variables.categoryId}`,
      ...options,
    })
  },
}
