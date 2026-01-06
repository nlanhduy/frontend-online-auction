import { clsx } from 'clsx'
import dayjs from 'dayjs'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'

import { UserRole } from '@/types/auth.types'

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ClassValue } from 'class-variance-authority/types'
import type { ProductStatus } from '@/types/product.type'
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

export const getTimeUntilStart = (startTime: string) => {
  const now = new Date()
  const start = new Date(startTime)
  const diff = start.getTime() - now.getTime()

  if (diff < 0) return null // Already started

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
}

export const getAuctionStatus = (startTime: string, endTime: string): 'NOT_STARTED' | 'ACTIVE' | 'ENDED' => {
  const now = new Date()
  const start = new Date(startTime)
  const end = new Date(endTime)

  if (now < start) return 'NOT_STARTED'
  if (now > end) return 'ENDED'
  return 'ACTIVE'
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

export function handleApiError(error: any, fallbackMessage = 'Something went wrong') {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage

  const finalMessage = Array.isArray(message) ? message.join(', ') : message

  toast.error(finalMessage)
  return finalMessage
}

export const formatReadableDate = (isoString?: string) => {
  if (!isoString) return ''
  return dayjs(isoString).format('DD/MM/YYYY HH:mm')
}

export async function uploadImageToCloudinary(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      },
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('Cloudinary error:', data)
      throw new Error(data.error?.message || 'Upload failed')
    }

    return data as {
      secure_url: string
      public_id: string
      width: number
      height: number
    }
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}

export const formatNumber = (value?: number) => {
  if (value === undefined || value === null) return ''
  return value.toLocaleString('en-US')
}

export const parseNumber = (value: string) => {
  const raw = value.replace(/,/g, '')
  const num = Number(raw)
  return isNaN(num) ? undefined : num
}

export const getProductStatusColor = (status: ProductStatus) => {
  const colors: Record<ProductStatus, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }

  return colors[status]
}

export const getUserRoleColor = (role: UserRole) => {
  const roles: Record<UserRole, string> = {
    [UserRole.Guest]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    [UserRole.Bidder]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    [UserRole.Seller]:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    [UserRole.Admin]:
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  }

  return roles[role]
}

export function formatDate(date: Date | undefined) {
  if (!date) {
    return ''
  }
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}

export const formatToYYYYMMDD = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
