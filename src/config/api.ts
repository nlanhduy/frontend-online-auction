/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios'

import type { AxiosRequestConfig, AxiosResponse } from 'axios'

export type ApiResponse<T = any> = Promise<AxiosResponse<T>>

export interface APIParams {
  options?: AxiosRequestConfig
}

export const axiosInstance = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken')
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
        const response = await axios.post(
          `${import.meta.env.VITE_IAM_SERVICE}/auth/refresh`,
          { refreshToken },
        )

        const { accessToken } = response.data
        localStorage.setItem('accessToken', accessToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        // Clear tokens and redirect to login
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
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
