/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from 'sonner'

import { QUERY_KEYS } from '@/constants/queryKey'
import { ProductAPI } from '@/services/api/product.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export const useAddToWatchList = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productId: string) =>
      ProductAPI.addToWatchList({
        variables: { productId },
      }),
    onSuccess: (_, productId) => {
      toast.success('Add to watch list successfully')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.watchList.all })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.watchList.check(productId),
      })
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to add to watch list'
      toast.error(message)
    },
  })
}

export const useRemoveFromWatchList = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productId: string) =>
      ProductAPI.removeFromWatchList({
        variables: { productId },
      }),
    onSuccess: (_, productId) => {
      toast.success('Removed from watch list')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.watchList.all })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.watchList.check(productId),
      })
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to remove from watch list')
    },
  })
}
