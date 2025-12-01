'use client'

import { Badge, Clock, Gavel } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { CategoryTag } from './category-tag'

interface ProductCardProps {
  id: string
  name: string
  image: string
  currentPrice: number
  categoryName: string
  categoryId: string
  endTime: Date
  bidCount: number
  highestBidder?: string
  buyNowPrice?: number
  createdAt: Date
  isNew?: boolean
  onCategoryClick?: (categoryId: string) => void
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}

const getTimeRemaining = (endTime: Date) => {
  const now = new Date()
  const diff = endTime.getTime() - now.getTime()

  if (diff < 0) return 'Đã kết thúc'

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `${days}d ${hours % 24}h`
  }

  return `${hours}h ${minutes}m`
}

export function ProductCard({
  id,
  name,
  image,
  currentPrice,
  categoryName,
  categoryId,
  endTime,
  bidCount,
  highestBidder,
  buyNowPrice,
  //   createdAt,
  isNew = false,
  onCategoryClick,
}: ProductCardProps) {
  return (
    <Link to={`/product/${id}`}>
      <Card
        className={cn(
          'overflow-hidden hover:shadow-lg transition-shadow h-full cursor-pointer relative flex flex-col',
          isNew && 'ring-2 ring-yellow-400 ring-offset-2',
        )}>
        {/* New badge */}
        {isNew && (
          <div className='absolute top-2 right-2 z-10'>
            <Badge className='bg-yellow-400 text-yellow-900 animate-pulse'>🆕 MỚI</Badge>
          </div>
        )}

        {/* Image */}
        <div className='relative w-full h-48 bg-gray-100 overflow-hidden flex-shrink-0'>
          <img
            src={image || '/placeholder.svg'}
            alt={name}
            className='w-full h-full object-cover hover:scale-105 transition-transform'
          />
        </div>

        {/* Content */}
        <div className='p-4 flex flex-col gap-3 flex-1'>
          {/* Category */}
          <CategoryTag
            name={categoryName}
            size='sm'
            onClick={() => {
              onCategoryClick?.(categoryId)
            }}
          />

          {/* Product name */}
          <h3 className='font-semibold text-sm line-clamp-2 hover:text-blue-600'>
            {name}
          </h3>

          {/* Current Price */}
          <div className='flex items-baseline gap-2'>
            <span className='text-lg font-bold text-red-600'>
              {formatPrice(currentPrice)}
            </span>
            {buyNowPrice && (
              <span className='text-xs text-gray-500 line-through'>
                {formatPrice(buyNowPrice)}
              </span>
            )}
          </div>

          {/* Bidder info */}
          {highestBidder && (
            <div className='text-xs text-gray-600 flex items-center gap-1'>
              <Gavel className='w-3 h-3' />
              <span>
                <strong>{highestBidder}</strong> bid cao nhất
              </span>
            </div>
          )}

          {/* Time remaining - sticky to bottom */}
          <div className='flex items-center justify-between text-xs text-gray-600 pt-2 border-t mt-auto'>
            <div className='flex items-center gap-1'>
              <Clock className='w-3 h-3' />
              <span className='font-semibold text-orange-600'>
                {getTimeRemaining(endTime)}
              </span>
            </div>
            <span>
              <strong>{bidCount}</strong> lượt
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
