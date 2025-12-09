import type { ClassValue } from 'class-variance-authority/types'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

export const getTimeRemaining = (endTime: string) => {
  const now = new Date()
  const end = new Date(endTime)
  const diff = end.getTime() - now.getTime()

  if (diff < 0) return 'Ended'

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `${days} days ${hours % 24} hours`
  }

  return `${hours} hours ${minutes} minutes`
}

export const isProductNew = (createdAt: string): boolean => {
  const thresholdMinutes = Number.parseInt(
    import.meta.env.VITE_NEW_PRODUCT_THRESHOLD_MINUTES || '60',
    10,
  )
  const now = new Date()
  const diffInMinutes = (now.getTime() - new Date(createdAt).getTime()) / (1000 * 60)

  return diffInMinutes <= thresholdMinutes
}

export const getPageNumbers = ({
  totalPages,
  currentPage,
}: {
  totalPages: number
  currentPage: number
}) => {
  const pages: (number | 'ellipsis')[] = []

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('ellipsis')
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push('ellipsis')
    pages.push(totalPages)
  }

  return pages
}
