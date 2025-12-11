import axios from 'axios'

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuthStore } from '@/store/authStore'

import type { AxiosRequestConfig, AxiosResponse } from 'axios'

export type ApiResponse<T = any> = Promise<AxiosResponse<T>>

export interface APIParams {
  options?: AxiosRequestConfig
  variables?: any
}

export const axiosInstance = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
axiosInstance.interceptors.request.use(
  config => {
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  },
)

// Response interceptor
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // Handle token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // TODO: read refresh token from cookies
        const refreshToken = localStorage.getItem('refreshToken')

        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        const response = await axios.post(
          `${import.meta.env.VITE_IAM_SERVICE}/auth/refresh`,
          { refreshToken },
        )

        const { accessToken, user } = response.data

        // Cập nhật token mới vào Zustand store
        useAuthStore.getState().setAuth(user, accessToken)

        // Retry request với token mới
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        // Clear auth state and redirect to login
        useAuthStore.getState().clearAuth()
        localStorage.removeItem('refreshToken')
        // window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

// Helper function to get headers
export const getHeaders = (customHeaders?: Record<string, string>) => {
  return {
    'Content-Type': 'application/json',
    ...customHeaders,
  }
}

// Generic request function
export const request = <T = any>(config: AxiosRequestConfig): ApiResponse<T> => {
  return axiosInstance(config)
}
