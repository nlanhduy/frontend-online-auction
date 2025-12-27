import { clsx } from 'clsx'
import dayjs from 'dayjs'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'

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
