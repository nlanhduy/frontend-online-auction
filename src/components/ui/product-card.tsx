'use client'

import { Clock, Gavel, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { CategoryTag } from './category-tag'
import { ShineBorder } from './shine-border'

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
  size?: 'medium' | 'large'
  onCategoryClick?: (categoryId: string) => void
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

const getTimeRemaining = (endTime: Date) => {
  const now = new Date()
  const diff = endTime.getTime() - now.getTime()

  if (diff < 0) return 'Ended'

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `${days}d ${hours % 24}h`
  }

  return `${hours}h ${minutes}m`
}

const isProductNew = (createdAt: Date): boolean => {
  const thresholdMinutes = Number.parseInt(
    import.meta.env.VITE_NEW_PRODUCT_THRESHOLD_MINUTES || '60',
    10,
  )
  const now = new Date()
  const diffInMinutes = (now.getTime() - new Date(createdAt).getTime()) / (1000 * 60)

  return diffInMinutes <= thresholdMinutes
}

function MediumProductCard({
  name,
  image,
  currentPrice,
  categoryName,
  categoryId,
  endTime,
  bidCount,
  highestBidder,
  buyNowPrice,
  createdAt,
  onCategoryClick,
}: ProductCardProps) {
  const isNew = isProductNew(createdAt)

  return (
    <Card
      className={cn(
        'overflow-hidden hover:shadow-lg transition-shadow h-full cursor-pointer relative flex flex-col p-4',
      )}>
      {isNew && (
        <ShineBorder
          borderWidth={3}
          duration={14}
          shineColor={['#A07CFE', '#FE8FB5', '#FFBE7B']}
          className='rounded-lg'
        />
      )}

      {isNew && (
        <div className='absolute top-2 right-2 z-10'>
          <Badge className='bg-yellow-400 text-yellow-900 animate-pulse'>🆕 NEW</Badge>
        </div>
      )}

      <div className='relative w-full bg-gray-100 overflow-hidden flex-shrink-0 h-48'>
        <img
          src={image || '/placeholder.svg'}
          alt={name}
          className='w-full h-full object-cover hover:scale-105 transition-transform'
        />
      </div>

      <div className='flex flex-col gap-3 flex-1 p-4'>
        <CategoryTag
          name={categoryName}
          size='sm'
          onClick={e => {
            e.preventDefault()
            onCategoryClick?.(categoryId)
          }}
        />

        <h3 className='text-sm font-semibold line-clamp-2 hover:text-blue-600'>{name}</h3>

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

        {highestBidder && (
          <div className='text-xs text-gray-600 flex items-center gap-1'>
            <Gavel className='w-3 h-3' />
            <span>
              <strong>{highestBidder}</strong> highest bidder
            </span>
          </div>
        )}

        <div className='flex items-center justify-between text-xs text-gray-600 pt-2 border-t mt-auto'>
          <div className='flex items-center gap-1'>
            <Clock className='w-3 h-3' />
            <span className='font-semibold text-orange-600'>
              {getTimeRemaining(endTime)}
            </span>
          </div>
          <span>
            <strong>{bidCount}</strong> bids
          </span>
        </div>
      </div>
    </Card>
  )
}

function LargeProductCard({
  name,
  image,
  currentPrice,
  categoryName,
  categoryId,
  endTime,
  bidCount,
  highestBidder,
  buyNowPrice,
  createdAt,
  onCategoryClick,
}: ProductCardProps) {
  const isNew = isProductNew(createdAt)

  return (
    <Card
      className={cn(
        'overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-row gap-0! h-full p-4',
      )}>
      {isNew && (
        <ShineBorder
          borderWidth={3}
          duration={10}
          shineColor={['#A07CFE', '#FE8FB5', '#FFBE7B']}
          className='rounded-lg'
        />
      )}

      <div className='relative w-1/2 shrink-0 overflow-hidden bg-gray-100'>
        <img
          src={image || '/placeholder.svg'}
          alt={name}
          className='w-full h-full object-cover hover:scale-110 transition-transform duration-300'
        />

        {isNew && (
          <div className='absolute top-3 left-3 z-10 flex gap-2'>
            <Badge className='bg-linear-to-r from-yellow-400 to-orange-400 text-yellow-900 animate-pulse flex items-center gap-1'>
              <Zap className='w-3 h-3' />
              NEW
            </Badge>
          </div>
        )}
      </div>

      <div className='w-1/2 flex flex-col justify-between pl-4 gap-4'>
        <div className='space-y-3'>
          <CategoryTag
            name={categoryName}
            size='sm'
            onClick={e => {
              e.preventDefault()
              onCategoryClick?.(categoryId)
            }}
          />

          <h3 className='text-lg font-bold text-gray-900 line-clamp-2 hover:text-blue-600'>
            {name}
          </h3>
        </div>

        <div className='space-y-3 flex-1'>
          <div className='flex items-baseline gap-3 flex-col'>
            {buyNowPrice && (
              <span className='text-sm text-gray-400 line-through'>
                {formatPrice(buyNowPrice)}
              </span>
            )}
            <span className='text-2xl font-bold text-red-600'>
              {formatPrice(currentPrice)}
            </span>
          </div>

          {highestBidder && (
            <div className='text-sm text-gray-600 flex items-center gap-2 bg-blue-50 p-2 rounded'>
              <Gavel className='w-4 h-4 text-blue-600' />
              <span className='flex flex-col'>
                <strong className='text-blue-600'>{highestBidder}</strong>
                <span>highest bidder</span>
              </span>
            </div>
          )}
        </div>

        <div className='flex flex-col justify-between text-sm pt-3 border-t border-gray-200'>
          <div className='flex items-center gap-2 text-orange-600 font-semibold'>
            <Clock className='w-4 h-4' />
            {getTimeRemaining(endTime)}
          </div>
          <span className='text-gray-600'>
            <strong>{bidCount}</strong> bids
          </span>
        </div>
      </div>
    </Card>
  )
}

export function ProductCard(props: ProductCardProps) {
  const { size = 'medium' } = props

  return (
    <Link to={`/product/${props.id}`}>
      <div className='relative h-full'>
        {size === 'large' ? (
          <LargeProductCard {...props} />
        ) : (
          <MediumProductCard {...props} />
        )}
      </div>
    </Link>
  )
}
