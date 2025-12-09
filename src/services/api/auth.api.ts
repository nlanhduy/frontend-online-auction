// src/services/auth.ts
import { getHeaders, request } from '@/config/api'

import type { APIParams, ApiResponse } from '@/config/api'

export const AuthAPI = {
  login({ options }: APIParams): ApiResponse {
    return request({
      method: 'post',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/auth/login`,
      ...options,
    })
  },

  register({ options }: APIParams): ApiResponse {
    return request({
      method: 'post',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/auth/register`,
      ...options,
    })
  },

  verifyOTP({ options }: APIParams): ApiResponse {
    return request({
      method: 'post',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/auth/verify-otp`,
      ...options,
    })
  },

  resendOTP({ options }: APIParams): ApiResponse {
    return request({
      method: 'post',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/auth/resend-otp`,
      ...options,
    })
  },

  refreshToken({ options }: APIParams): ApiResponse {
    return request({
      method: 'post',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/auth/refresh`,
      ...options,
    })
  },

  logout({ options }: APIParams): ApiResponse {
    return request({
      method: 'post',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/auth/logout`,
      ...options,
    })
  },

  getMe({ options }: APIParams): ApiResponse {
    return request({
      method: 'get',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/auth/me`,
      ...options,
    })
  },
}
