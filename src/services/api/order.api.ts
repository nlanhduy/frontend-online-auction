import { getHeaders, request } from '@/config/api'

import type { APIParams, ApiResponse } from '@/config/api'

export const OrderAPI = {
  // Get order by ID
  getOrderById({ options, variables }: APIParams): ApiResponse {
    return request({
      method: 'get',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/orders/${variables.orderId}`,
      ...options,
    })
  },

  // Get product with order info
  getProductWithOrder({ options, variables }: APIParams): ApiResponse {
    return request({
      method: 'get',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/products/${variables.productId}`,
      ...options,
    })
  },

  // Create PayPal order
  createPaymentOrder({ options, variables }: APIParams): ApiResponse {
    return request({
      method: 'post',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/payment/create-order`,
      data: { productId: variables.productId },
      ...options,
    })
  },

  // Capture PayPal payment
  capturePaymentOrder({ options, variables }: APIParams): ApiResponse {
    return request({
      method: 'post',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/payment/capture-order/${variables.orderId}/${variables.productId}`,
      ...options,
    })
  },

  // Submit shipping info
  submitShippingInfo({ options, variables }: APIParams): ApiResponse {
    return request({
      method: 'post',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/orders/${variables.orderId}/shipping`,
      data: variables.data,
      ...options,
    })
  },

  // Seller confirms shipment
  confirmShipment({ options, variables }: APIParams): ApiResponse {
    return request({
      method: 'post',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/orders/${variables.orderId}/confirm-shipment`,
      data: variables.data,
      ...options,
    })
  },

  // Buyer confirms received
  confirmReceived({ options, variables }: APIParams): ApiResponse {
    return request({
      method: 'post',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/orders/${variables.orderId}/confirm-received`,
      ...options,
    })
  },

  // Cancel order
  cancelOrder({ options, variables }: APIParams): ApiResponse {
    return request({
      method: 'post',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/orders/${variables.orderId}/cancel`,
      data: { reason: variables.reason },
      ...options,
    })
  },

  // Create rating
  createRating({ options, variables }: APIParams): ApiResponse {
    return request({
      method: 'post',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/users/ratings`,
      data: variables.data,
      ...options,
    })
  },

  // Update rating
  updateRating({ options, variables }: APIParams): ApiResponse {
    return request({
      method: 'patch',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/users/ratings/${variables.ratingId}`,
      data: variables.data,
      ...options,
    })
  },

  // Get order details
  getOrderDetails({ options, variables }: APIParams): ApiResponse {
    return request({
      method: 'get',
      headers: getHeaders(),
      url: `${import.meta.env.VITE_BACKEND_URL}/orders/${variables.orderId}`,
      ...options,
    })
  },
}
