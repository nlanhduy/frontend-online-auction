/* eslint-disable @typescript-eslint/no-explicit-any */
import { ThumbsDown, ThumbsUp } from 'lucide-react'
import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/ui/product-card'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { QUERY_KEYS } from '@/constants/queryKey'
import { handleApiError } from '@/lib/utils'
import { AuthAPI } from '@/services/api/auth.api'
import { ProductAPI } from '@/services/api/product.api'
import { useMutation, useQuery } from '@tanstack/react-query'

import type { Product } from '@/types/product.type'
const RatingWonAuction = () => {
  const { id: productId } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [ratingValue, setRatingValue] = useState<1 | -1 | null>(null)
  const [comment, setComment] = useState('')

  const productDetailQuery = useQuery<Product>({
    queryKey: QUERY_KEYS.products.detail(productId ?? ''),
    queryFn: async () => {
      const response = await ProductAPI.getProductDetail({
        variables: { productId: productId },
      })
      return response.data
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
  })

  const createRatingMutation = useMutation({
    mutationFn: async ({
      receiverId,
      value,
      comment,
    }: {
      receiverId: string
      value: 1 | -1
      comment: string
    }) => {
      const response = await AuthAPI.createRating({
        options: {
          data: { receiverId, value, comment },
        },
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('Rating submitted successfully!')
      navigate(`/products/${productId}`)
    },
    onError: (err: any) => {
      handleApiError(err, 'Failed to submit rating')
    },
  })

  if (productDetailQuery.isLoading) {
    return (
      <div className='container mx-auto py-12 flex items-center justify-center w-full h-screen'>
        <Button className='mx-auto' size={'lg'} disabled>
          <Spinner />
          Loading...
        </Button>
      </div>
    )
  }

  const productDetail = productDetailQuery.data as Product

  if (!productDetail) {
    return (
      <div className='container mx-auto py-12'>
        <div className='p-8 text-center'>Product not found</div>
        <Button onClick={() => navigate(-1)}>Go back</Button>
      </div>
    )
  }

  const seller = productDetail.seller

  const trimmedComment = comment.trim()
  const isCommentValid = trimmedComment.length >= 5
  const isFormValid = ratingValue !== null && isCommentValid

  const handleSubmitRating = () => {
    if (!isFormValid || !ratingValue) return

    createRatingMutation.mutate({
      receiverId: seller.id, // ID của seller
      value: ratingValue,
      comment: trimmedComment,
    })
  }

  return (
    <div className='max-w-7xl mx-auto p-6 space-y-6'>
      {/* Product Info Card */}
      <ProductCard size='detail' product={productDetail} />

      {/* Rating Form */}
      <div className='bg-white rounded-lg shadow-md p-6'>
        <h2 className='text-xl font-bold text-gray-900 mb-4'>
          Rate Seller: {seller.fullName} ({seller.id})
        </h2>

        <div className='space-y-6'>
          {/* Rating Buttons */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-3'>
              Your Rating <span className='text-red-500'>*</span>
            </label>
            <div className='flex gap-4'>
              <Button
                type='button'
                variant={ratingValue === 1 ? 'default' : 'outline'}
                className={`flex-1 h-20 ${
                  ratingValue === 1
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'hover:bg-green-50 hover:border-green-600'
                }`}
                onClick={() => setRatingValue(1)}>
                <ThumbsUp className='h-6 w-6 mr-2' />
                Positive
              </Button>
              <Button
                type='button'
                variant={ratingValue === -1 ? 'default' : 'outline'}
                className={`flex-1 h-20 ${
                  ratingValue === -1
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'hover:bg-red-50 hover:border-red-600'
                }`}
                onClick={() => setRatingValue(-1)}>
                <ThumbsDown className='h-6 w-6 mr-2' />
                Negative
              </Button>
            </div>
          </div>

          {/* Comment Textarea */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Comment <span className='text-red-500'>*</span>
              <span className='text-xs text-gray-500 ml-2'>(minimum 5 characters)</span>
            </label>
            <Textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder='Share your experience with this seller...'
              className='min-h-32'
              maxLength={500}
            />
            <div className='flex justify-between mt-1'>
              <span
                className={`text-xs ${
                  trimmedComment.length >= 5 ? 'text-green-600' : 'text-gray-500'
                }`}>
                {trimmedComment.length >= 5 ? '✓' : ''} {trimmedComment.length} / 500
                characters
              </span>
              {trimmedComment.length > 0 && trimmedComment.length < 5 && (
                <span className='text-xs text-red-500'>
                  Need {5 - trimmedComment.length} more characters
                </span>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className='flex gap-3'>
            <Button
              onClick={handleSubmitRating}
              disabled={!isFormValid || createRatingMutation.isPending}
              className='flex-1'>
              {createRatingMutation.isPending ? (
                <>
                  <Spinner />
                  Submitting...
                </>
              ) : (
                'Submit Rating'
              )}
            </Button>
            <Button
              variant='outline'
              onClick={() => navigate(`/products/${productId}`)}
              disabled={createRatingMutation.isPending}>
              Cancel
            </Button>
          </div>

          {/* Validation Messages */}
          {!isFormValid && (ratingValue !== null || comment.length > 0) && (
            <div className='bg-yellow-50 border border-yellow-200 rounded-md p-3'>
              <p className='text-sm text-yellow-800 font-medium mb-1'>
                Please complete the following:
              </p>
              <ul className='text-sm text-yellow-700 list-disc list-inside space-y-1'>
                {ratingValue === null && <li>Select a rating (Positive or Negative)</li>}
                {!isCommentValid && <li>Write a comment with at least 5 characters</li>}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RatingWonAuction
