/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios'

import { useAuthStore } from '@/store/authStore'

import type { AxiosRequestConfig, AxiosResponse } from 'axios'

export type ApiResponse<T = any> = Promise<AxiosResponse<T>>

export interface APIParams {
  options?: AxiosRequestConfig
  variables?: any
}

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
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

let isRefreshing = false
let failedQueue: {
  resolve: (token: string) => void
  reject: (error: any) => void
}[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(promise => {
    if (error) promise.reject(error)
    else promise.resolve(token as string)
  })
  failedQueue = []
}

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/refresh')) {
        useAuthStore.getState().clearAuth()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: token => {
              originalRequest.headers = {
                ...originalRequest.headers,
                Authorization: `Bearer ${token}`,
              }
              resolve(axiosInstance(originalRequest))
            },
            reject,
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )

        const { accessToken, user } = res.data

        useAuthStore.getState().setAuth(user, accessToken)
        processQueue(null, accessToken)

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${accessToken}`,
        }

        return axiosInstance(originalRequest)
      } catch (err) {
        processQueue(err, null)
        useAuthStore.getState().clearAuth()
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
        return Promise.reject(err)
      } finally {
        isRefreshing = false
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
