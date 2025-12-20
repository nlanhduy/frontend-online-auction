import axios from 'axios'
import Cookies from 'js-cookie'

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
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use(
  config => {
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error),
)

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = Cookies.get('refresh_token')
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        const response = await axios.post(
          `${import.meta.env.VITE_IAM_SERVICE}/auth/refresh`,
          { withCredentials: true },
        )

        const { accessToken, user } = response.data

        useAuthStore.getState().setAuth(user, accessToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return axiosInstance(originalRequest)
      } catch (err) {
        useAuthStore.getState().clearAuth()
        Cookies.remove('refreshToken')
        return Promise.reject(err)
      }
    }

    return Promise.reject(error)
  },
)

export const getHeaders = (customHeaders?: Record<string, string>) => ({
  'Content-Type': 'application/json',
  ...customHeaders,
})

export const request = <T = any>(config: AxiosRequestConfig): ApiResponse<T> => {
  return axiosInstance(config)
}
