'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { QUERY_KEYS } from '@/constants/queryKey'
import { handleApiError } from '@/lib/utils'
import { CategoryAPI } from '@/services/api/category.api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { CategoryFormData } from '@/lib/validation/category'
export function useCategories() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  const queryClient = useQueryClient()
  const { data: categoryData } = useQuery({
    queryKey: QUERY_KEYS.categories.all,
    queryFn: () => CategoryAPI.getAllCategories({}),
    staleTime: Infinity,
  })

  const createCategoryMutation = useMutation({
    mutationFn: (data: CategoryFormData) =>
      CategoryAPI.createCategory({
        options: { data },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories.all })
      toast.success('Category created successfully')
    },
    onError: err => {
      handleApiError(err)
    },
  })

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryFormData }) =>
      CategoryAPI.updateCategory({
        variables: { categoryId: id },
        options: { data },
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories.all })
      toast.success('Category updated successfully')
    },
    onError: err => {
      handleApiError(err)
    },
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) =>
      CategoryAPI.deleteCategory({
        variables: { categoryId: id },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories.all })
      toast.success('Category deleted successfully')
    },
    onError: err => {
      handleApiError(err)
    },
  })
  return {
    categories: categoryData?.data || [],
    isFetchingCategories: Boolean(categoryData === undefined),
    selectedCategoryId,
    setSelectedCategoryId,

    createCategoryMutation,
    updateCategoryMutation,
    deleteCategoryMutation,
  }
}
