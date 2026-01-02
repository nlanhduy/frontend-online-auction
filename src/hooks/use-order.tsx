/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { QUERY_KEYS } from '@/constants/queryKey'
import { handleApiError } from '@/lib/utils'
import { OrderAPI } from '@/services/api/order.api'

import type {
  ConfirmShipmentRequest,
  CreateRatingRequest,
  ShippingInfoRequest,
  UpdateRatingRequest,
} from '@/types/order.type'

export const useOrderDetails = (productId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.orders.productOrder(productId),
    queryFn: async () => {
      const response = await OrderAPI.getProductWithOrder({
        variables: { productId },
      })
      return response.data
    },
    enabled: !!productId,
  })
}

export const useCreatePayment = (productId: string) => {
  return useMutation({
    mutationFn: async () => {
      const response = await OrderAPI.createPaymentOrder({
        variables: { productId },
      })
      return response.data
    },
    onSuccess: (data: any) => {
      sessionStorage.setItem('payment_product_id', productId)
      window.location.href = data.approvalUrl
    },
    onError: (error: any) => {
      handleApiError(error, 'Không thể tạo thanh toán')
    },
  })
}

export const useSubmitShipping = (orderId: string, productId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ShippingInfoRequest) => {
      const response = await OrderAPI.submitShippingInfo({
        variables: { orderId, data },
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('Đã gửi địa chỉ giao hàng!')
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.orders.productOrder(productId),
      })
    },
    onError: (error: any) => {
      handleApiError(error, 'Không thể gửi địa chỉ')
    },
  })
}

export const useConfirmShipment = (orderId: string, productId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ConfirmShipmentRequest) => {
      const response = await OrderAPI.confirmShipment({
        variables: { orderId, data },
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('Đã xác nhận gửi hàng!')
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.orders.productOrder(productId),
      })
    },
    onError: (error: any) => {
      handleApiError(error, 'Không thể xác nhận gửi hàng')
    },
  })
}

export const useConfirmReceived = (orderId: string, productId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await OrderAPI.confirmReceived({
        variables: { orderId },
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('Đã xác nhận nhận hàng! Người bán sẽ nhận tiền trong vài phút.')
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.orders.productOrder(productId),
      })
    },
    onError: (error: any) => {
      handleApiError(error, 'Không thể xác nhận nhận hàng')
    },
  })
}

export const useCancelOrder = (orderId: string, productId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reason: string) => {
      const response = await OrderAPI.cancelOrder({
        variables: { orderId, reason },
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('Đã hủy giao dịch!')
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.orders.productOrder(productId),
      })
    },
    onError: (error: any) => {
      handleApiError(error, 'Không thể hủy giao dịch')
    },
  })
}

export const useCreateRating = (productId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateRatingRequest) => {
      const response = await OrderAPI.createRating({
        variables: { data },
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('Đã gửi đánh giá!')
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.orders.productOrder(productId),
      })
    },
    onError: (error: any) => {
      handleApiError(error, 'Không thể gửi đánh giá')
    },
  })
}

export const useUpdateRating = (ratingId: string, productId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateRatingRequest) => {
      const response = await OrderAPI.updateRating({
        variables: { ratingId, data },
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('Đã cập nhật đánh giá!')
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.orders.productOrder(productId),
      })
    },
    onError: (error: any) => {
      handleApiError(error, 'Không thể cập nhật đánh giá')
    },
  })
}
