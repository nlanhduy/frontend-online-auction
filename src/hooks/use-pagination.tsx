/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useCallback, useState } from 'react'

export interface ServerPaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  hasPrevious: boolean
  hasNext: boolean
}

export interface ServerPaginationData<T = any> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

interface UsePaginationOptions {
  initialPage?: number
  initialPageSize?: number
  scrollToTop?: boolean
}

interface UsePaginationResult<T> {
  // State
  currentPage: number
  pageSize: number

  // Handlers
  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  goToPage: (page: number) => void
  nextPage: () => void
  previousPage: () => void

  // Computed pagination info
  getPaginationInfo: (data?: ServerPaginationData<T> | null) => ServerPaginationInfo

  // Reset
  reset: () => void
}

export function usePagination<T = any>(
  options: UsePaginationOptions = {},
): UsePaginationResult<T> {
  const { initialPage = 1, initialPageSize = 12, scrollToTop = true } = options

  const [currentPage, setCurrentPageState] = useState(initialPage)
  const [pageSize, setPageSizeState] = useState(initialPageSize)

  const scrollTop = useCallback(() => {
    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [scrollToTop])

  const setCurrentPage = useCallback(
    (page: number) => {
      setCurrentPageState(page)
      scrollTop()
    },
    [scrollTop],
  )

  const setPageSize = useCallback(
    (size: number) => {
      setPageSizeState(size)
      setCurrentPageState(1) // Reset về trang 1 khi thay đổi page size
      scrollTop()
    },
    [scrollTop],
  )

  const getPaginationInfo = useCallback(
    (data?: ServerPaginationData<T> | null): ServerPaginationInfo => {
      if (!data) {
        return {
          currentPage,
          totalPages: 1,
          totalItems: 0,
          pageSize,
          hasPrevious: false,
          hasNext: false,
        }
      }

      return {
        currentPage: data.page,
        totalPages: data.totalPages,
        totalItems: data.total,
        pageSize: data.limit,
        hasPrevious: data.hasPrevious,
        hasNext: data.hasNext,
      }
    },
    [currentPage, pageSize],
  )

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(page)
    },
    [setCurrentPage],
  )

  const nextPage = useCallback(() => {
    setCurrentPage(currentPage + 1)
  }, [currentPage, setCurrentPage])

  const previousPage = useCallback(() => {
    setCurrentPage(currentPage - 1)
  }, [currentPage, setCurrentPage])

  const reset = useCallback(() => {
    setCurrentPageState(initialPage)
    setPageSizeState(initialPageSize)
  }, [initialPage, initialPageSize])

  return {
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    goToPage,
    nextPage,
    previousPage,
    getPaginationInfo,
    reset,
  }
}
