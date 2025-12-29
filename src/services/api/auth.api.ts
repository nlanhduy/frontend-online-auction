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

  requestRegister({ options }: APIParams): ApiResponse {
    return request({
      method: 'post',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/auth/register/request`,
      ...options,
    })
  },
  verifyRegister({ options }: APIParams): ApiResponse {
    return request({
      method: 'post',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/auth/register/verify`,
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
      url: `${import.meta.env.VITE_BACKEND_URL}/users/me`,
      ...options,
    })
  },

  changeName({ options }: APIParams): ApiResponse {
    return request({
      method: 'patch',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/users/change-name`,
      ...options,
    })
  },

  requestChangeMail({ options }: APIParams): ApiResponse {
    return request({
      method: 'post',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/users/change-email/request`,
      ...options,
    })
  },

  verifyChangeMail({ options }: APIParams): ApiResponse {
    return request({
      method: 'post',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/users/change-email/verify`,
      ...options,
    })
  },
  changePassword({ options }: APIParams): ApiResponse {
    return request({
      method: 'patch',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/users/change-password`,
      ...options,
    })
  },
  requestToSeller({ options }: APIParams): ApiResponse {
    return request({
      method: 'post',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/users/seller-upgrade/request`,
      ...options,
    })
  },
  getAllPendingSellers({ options }: APIParams): ApiResponse {
    return request({
      method: 'get',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/users/seller-upgrade/pending`,
      ...options,
    })
  },
  getRequestSellerStatus({ options }: APIParams): ApiResponse {
    return request({
      method: 'get',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/users/me/seller-upgrade-requests`,
      ...options,
    })
  },
  approveSeller({ options, variables }: APIParams): ApiResponse {
    return request({
      method: 'post',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/users/seller-upgrade/${variables.requestId}/approve`,
      ...options,
    })
  },
  rejectSeller({ options, variables }: APIParams): ApiResponse {
    return request({
      method: 'post',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/users/seller-upgrade/${variables.requestId}/reject`,
      ...options,
    })
  },
  requestForgetPassword({ options }: APIParams): ApiResponse {
    return request({
      method: 'post',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/users/forgot-password/request`,
      ...options,
    })
  },
  verifyForgetPassword({ options }: APIParams): ApiResponse {
    return request({
      method: 'post',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/users/forgot-password/verify`,
      ...options,
    })
  },

  getMyProducts({ options }: APIParams): ApiResponse {
    return request({
      method: 'get',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/users/me/products`,
      ...options,
    })
  },

  getBidderActiveBids({ options }: APIParams): ApiResponse {
    return request({
      method: 'get',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/users/me/active-bids`,
      ...options,
    })
  },
  getBidderWonAuctions({ options }: APIParams): ApiResponse {
    return request({
      method: 'get',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/users/me/won-auctions`,
      ...options,
    })
  },

  getSellerCopletedSales({ options }: APIParams): ApiResponse {
    return request({
      method: 'get',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/users/me/completed-sales`,
      ...options,
    })
  },
  createRating({ options }: APIParams): ApiResponse {
    return request({
      method: 'post',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/users/ratings`,
      ...options,
    })
  },
  getMyRating({ options }: APIParams): ApiResponse {
    return request({
      method: 'get',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/users/me/ratings/details  `,
      ...options,
    })
  },
}
