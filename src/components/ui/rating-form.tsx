import { MessageSquare, ThumbsDown, ThumbsUp } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import type { Rating } from '@/types/order.type'

interface RatingFormProps {
  targetUser: {
    id: string
    fullName: string
  }
  userType: 'buyer' | 'seller'
  existingRating?: Rating
  onSubmit: (data: { value: number; comment?: string }) => Promise<void>
  isLoading?: boolean
}

export function RatingForm({
  targetUser,
  userType,
  existingRating,
  onSubmit,
  isLoading = false,
}: RatingFormProps) {
  const [ratingValue, setRatingValue] = useState<number | null>(
    existingRating?.value || null,
  )
  const [comment, setComment] = useState(existingRating?.comment || '')
  const [isEditing, setIsEditing] = useState(!existingRating)

  const handleSubmit = async () => {
    if (ratingValue === null) {
      toast.error('Please select +1 or -1 rating')
      return
    }

    try {
      await onSubmit({
        value: ratingValue,
        comment: comment.trim() || undefined,
      })
      setIsEditing(false)
      toast.success(existingRating ? 'Rating updated!' : 'Rating submitted!')
    } catch (error) {
      toast.error('Cannot submit rating. Please try again.')
    }
  }

  if (existingRating && !isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span>
              ⭐ Rate {userType === 'buyer' ? 'Seller' : 'Buyer'}:{' '}
              {targetUser.fullName}
            </span>
            <Button variant='outline' size='sm' onClick={() => setIsEditing(true)}>
              ✏️ Edit
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='flex items-center gap-2'>
            {existingRating.value === 1 ? (
              <span className='flex items-center gap-2 text-green-600'>
                <ThumbsUp className='h-5 w-5' />
                <span className='font-semibold'>Good (+1)</span>
              </span>
            ) : (
              <span className='flex items-center gap-2 text-red-600'>
                <ThumbsDown className='h-5 w-5' />
                <span className='font-semibold'>Bad (-1)</span>
              </span>
            )}
          </div>
          {existingRating.comment && (
            <div className='flex items-start gap-2 rounded-lg bg-gray-50 p-3'>
              <MessageSquare className='mt-0.5 h-4 w-4 text-gray-500' />
              <p className='text-sm text-gray-700'>{existingRating.comment}</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          ⭐ Rate {userType === 'buyer' ? 'Seller' : 'Buyer'}:{' '}
          {targetUser.fullName}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex gap-3'>
          <Button
            type='button'
            variant={ratingValue === 1 ? 'default' : 'outline'}
            className={cn('flex-1', {
              'border-green-500 bg-green-500 text-white hover:bg-green-600':
                ratingValue === 1,
            })}
            onClick={() => setRatingValue(1)}>
            <ThumbsUp className='mr-2 h-5 w-5' />
            Good (+1)
          </Button>

          <Button
            type='button'
            variant={ratingValue === -1 ? 'default' : 'outline'}
            className={cn('flex-1', {
              'border-red-500 bg-red-500 text-white hover:bg-red-600': ratingValue === -1,
            })}
            onClick={() => setRatingValue(-1)}>
            <ThumbsDown className='mr-2 h-5 w-5' />
            Bad (-1)
          </Button>
        </div>

        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Comment (optional)
          </label>
          <Textarea
            placeholder='Share your experience about this transaction...'
            value={comment}
            onChange={e => setComment(e.target.value)}
            maxLength={500}
            rows={4}
          />
          <p className='mt-1 text-xs text-gray-500'>{comment.length}/500 characters</p>
        </div>

        <div className='flex gap-2'>
          <Button onClick={handleSubmit} disabled={isLoading || ratingValue === null}>
            {isLoading
              ? 'Submitting...'
              : existingRating
                ? 'Update Rating'
                : 'Submit Rating'}
          </Button>
          {existingRating && (
            <Button variant='outline' onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
