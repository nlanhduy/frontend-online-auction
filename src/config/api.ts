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
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

/* ======================= REQUEST INTERCEPTOR ======================= */
axiosInstance.interceptors.request.use(
  config => {
    const token = useAuthStore.getState().accessToken

    console.log('[AXIOS][REQUEST]', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
    })

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('[AXIOS][REQUEST] Authorization header attached')
    }

    return config
  },
  error => {
    console.error('[AXIOS][REQUEST ERROR]', error)
    return Promise.reject(error)
  },
)

/* ======================= REFRESH STATE ======================= */
let isRefreshing = false

let failedQueue: {
  resolve: (token: string) => void
  reject: (error: any) => void
}[] = []

const processQueue = (error: any, token: string | null = null) => {
  console.log('[AXIOS][QUEUE] Processing queue', {
    queueLength: failedQueue.length,
    success: !error,
  })

  failedQueue.forEach(prom => {
    if (error) prom.reject(error)
    else prom.resolve(token as string)
  })

  failedQueue = []
}

/* ======================= RESPONSE INTERCEPTOR ======================= */
axiosInstance.interceptors.response.use(
  response => {
    console.log('[AXIOS][RESPONSE SUCCESS]', {
      url: response.config.url,
      status: response.status,
    })
    return response
  },
  async error => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean
    }

    console.warn('[AXIOS][RESPONSE ERROR]', {
      url: originalRequest?.url,
      status: error.response?.status,
      isRetry: originalRequest?._retry,
    })

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn('[AXIOS][401] Unauthorized detected')

      if (isRefreshing) {
        console.log('[AXIOS][REFRESH] Already refreshing → queue request')

        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              console.log('[AXIOS][QUEUE] Retrying queued request', originalRequest.url)

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

      console.log('[AXIOS][REFRESH] Starting token refresh')

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_IAM_SERVICE}/auth/refresh`,
          {},
          { withCredentials: true },
        )

        const { accessToken, user } = res.data

        console.log('[AXIOS][REFRESH] Refresh success', {
          hasAccessToken: !!accessToken,
        })

        useAuthStore.getState().setAuth(user, accessToken)

        processQueue(null, accessToken)

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${accessToken}`,
        }

        console.log('[AXIOS][RETRY] Retrying original request', originalRequest.url)

        return axiosInstance(originalRequest)
      } catch (err) {
        console.error('[AXIOS][REFRESH FAILED]', err)

        processQueue(err, null)

        useAuthStore.getState().clearAuth()

        console.warn('[AXIOS][LOGOUT] Redirecting to /login')
        window.location.href = '/login'

        return Promise.reject(err)
      } finally {
        isRefreshing = false
        console.log('[AXIOS][REFRESH] Finished refresh cycle')
      }
    }

    return Promise.reject(error)
  },
)

/* ======================= HELPERS ======================= */
export const getHeaders = (customHeaders?: Record<string, string>) => ({
  'Content-Type': 'application/json',
  ...customHeaders,
})

export const request = <T = any>(config: AxiosRequestConfig): ApiResponse<T> => {
  console.log('[AXIOS][REQUEST HELPER]', config.url)
  return axiosInstance(config)
}
