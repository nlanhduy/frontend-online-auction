// src/services/auth.ts
import { getHeaders, request } from '@/config/api'

import type { APIParams, ApiResponse } from '@/config/api'

export const APIService = {
  login({ options }: APIParams): ApiResponse {
    return request({
      method: 'post',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_SERVICE}/auth/login`,
      ...options,
    })
  },

  register({ options }: APIParams): ApiResponse {
    return request({
      method: 'post',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_SERVICE}/auth/register`,
      ...options,
    })
  },

  verifyOTP({ options }: APIParams): ApiResponse {
    return request({
      method: 'post',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_SERVICE}/auth/verify-otp`,
      ...options,
    })
  },

  resendOTP({ options }: APIParams): ApiResponse {
    return request({
      method: 'post',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_SERVICE}/auth/resend-otp`,
      ...options,
    })
  },

  refreshToken({ options }: APIParams): ApiResponse {
    return request({
      method: 'post',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_SERVICE}/auth/refresh`,
      ...options,
    })
  },

  logout({ options }: APIParams): ApiResponse {
    return request({
      method: 'post',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_SERVICE}/auth/logout`,
      ...options,
    })
  },

  getMe({ options }: APIParams): ApiResponse {
    return request({
      method: 'get',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_SERVICE}/auth/me`,
      ...options,
    })
  },
}
