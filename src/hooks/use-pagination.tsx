'use client'

import { useMemo, useState } from 'react'

export interface PaginationResult<T> {
  items: T[]
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  hasPrevious: boolean
  hasNext: boolean
  goToPage: (page: number) => void
  nextPage: () => void
  previousPage: () => void
}

interface UsePaginationOptions {
  pageSize?: number
  initialPage?: number
}

export function usePagination<T>(
  items: T[],
  options: UsePaginationOptions = {},
): PaginationResult<T> {
  const { pageSize = 12, initialPage = 1 } = options
  const [currentPage, setCurrentPage] = useState(initialPage)

  const pagination = useMemo(() => {
    const totalItems = items.length
    const totalPages = Math.ceil(totalItems / pageSize)
    const validPage = Math.max(1, Math.min(currentPage, totalPages || 1))

    const startIdx = (validPage - 1) * pageSize
    const endIdx = startIdx + pageSize
    const paginatedItems = items.slice(startIdx, endIdx)

    return {
      items: paginatedItems,
      currentPage: validPage,
      totalPages: totalPages || 1,
      totalItems,
      pageSize,
      hasPrevious: validPage > 1,
      hasNext: validPage < (totalPages || 1),
    }
  }, [items, currentPage, pageSize])

  const goToPage = (page: number) => {
    const maxPage = Math.ceil(items.length / pageSize)
    setCurrentPage(Math.max(1, Math.min(page, maxPage || 1)))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const nextPage = () => {
    if (pagination.hasNext) {
      setCurrentPage(prev => prev + 1)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const previousPage = () => {
    if (pagination.hasPrevious) {
      setCurrentPage(prev => prev - 1)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return {
    ...pagination,
    goToPage,
    nextPage,
    previousPage,
  }
}
