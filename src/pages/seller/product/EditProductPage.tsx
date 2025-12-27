/* eslint-disable @typescript-eslint/no-explicit-any */
import { Plus } from 'lucide-react'
import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import RichTextEditor from '@/components/ui/ckeditor'
import { Spinner } from '@/components/ui/spinner'
import { QUERY_KEYS } from '@/constants/queryKey'
import { renderRichText } from '@/lib/renderRichText'
import {
  formatPrice,
  formatReadableDate,
  getProductStatusColor,
  handleApiError,
} from '@/lib/utils'
import { ProductAPI } from '@/services/api/product.api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { Product } from '@/types/product.type'

const EditProductPage = () => {
  const { id: productId } = useParams<{ id: string }>()
  const [newDescription, setNewDescription] = useState('')

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const productDetailQuery = useQuery({
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

  const productDetail = productDetailQuery.data as Product

  const addProductDescription = useMutation({
    mutationFn: async ({
      productId,
      description,
    }: {
      productId: string
      description: string
    }) => {
      const response = await ProductAPI.updateProduct({
        variables: { productId },
        options: {
          data: { description },
        },
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('Description added successfully!')
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.products.detail(productId ?? ''),
      })
      setNewDescription('')
    },
    onError: (err: any) => {
      handleApiError(err, 'Failed to add description')
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

  if (!productDetail) {
    return (
      <div className='container mx-auto py-12'>
        <div className='p-8 text-center'>Product not found</div>
        <Button onClick={() => navigate(-1)}>Go back</Button>
      </div>
    )
  }

  const handleSubmitDescription = () => {
    addProductDescription.mutate({
      productId: productDetail.id,
      description: newDescription,
    })
  }

  return (
    <div className='max-w-7xl mx-auto p-6 space-y-6'>
      {/* Product Info Card */}
      <div className='bg-white rounded-lg shadow-md p-6'>
        <div className='flex items-start justify-between mb-4'>
          <h1 className='text-2xl font-bold text-gray-900'>{productDetail.name}</h1>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getProductStatusColor(productDetail.status)}`}>
            {productDetail.status}
          </span>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Images Section */}
          <div>
            <h3 className='text-sm font-semibold text-gray-700 mb-3'>Main Image</h3>
            <img
              src={productDetail.mainImage}
              alt={productDetail.name}
              className='w-full h-64 object-cover rounded-lg mb-4'
            />

            <h3 className='text-sm font-semibold text-gray-700 mb-3'>
              Additional Images
            </h3>
            <div className='grid grid-cols-3 gap-2'>
              {productDetail.images.map(
                (img: string | undefined, idx: React.Key | null | undefined) => (
                  <img
                    key={idx}
                    src={img}
                    alt={productDetail.name}
                    className='w-full h-24 object-cover rounded'
                  />
                ),
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className='space-y-4'>
            <div>
              <h3 className='text-sm font-semibold text-gray-700'>Category</h3>
              <p className='text-gray-900'>{productDetail.category.name}</p>
              <p className='text-sm text-gray-500'>
                {productDetail.category.description}
              </p>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <h3 className='text-sm font-semibold text-gray-700'>Initial Price</h3>
                <p className='text-lg font-bold text-blue-600'>
                  {formatPrice(productDetail.initialPrice)}
                </p>
              </div>
              <div>
                <h3 className='text-sm font-semibold text-gray-700'>Current Price</h3>
                <p className='text-lg font-bold text-green-600'>
                  {formatPrice(productDetail.currentPrice)}
                </p>
              </div>
              <div>
                <h3 className='text-sm font-semibold text-gray-700'>Buy Now Price</h3>
                <p className='text-lg font-bold text-purple-600'>
                  {formatPrice(productDetail.buyNowPrice)}
                </p>
              </div>
              <div>
                <h3 className='text-sm font-semibold text-gray-700'>Price Step</h3>
                <p className='text-gray-900'>{formatPrice(productDetail.priceStep)}</p>
              </div>
            </div>

            <div>
              <h3 className='text-sm font-semibold text-gray-700'>Start Time</h3>
              <p className='text-gray-900'>
                {formatReadableDate(productDetail.startTime)}
              </p>
            </div>

            <div>
              <h3 className='text-sm font-semibold text-gray-700'>End Time</h3>
              <p className='text-gray-900'>{formatReadableDate(productDetail.endTime)}</p>
            </div>

            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <h3 className='font-semibold text-gray-700'>Created At</h3>
                <p className='text-gray-600'>
                  {formatReadableDate(productDetail.createdAt)}
                </p>
              </div>
              <div>
                <h3 className='font-semibold text-gray-700'>Updated At</h3>
                <p className='text-gray-600'>
                  {formatReadableDate(productDetail.updatedAt)}
                </p>
              </div>
            </div>

            <div>
              <h3 className='text-sm font-semibold text-gray-700'>Seller</h3>
              <p className='text-gray-900'>{productDetail.seller.fullName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Descriptions History */}
      <div className='bg-white rounded-lg shadow-md p-6'>
        <h2 className='text-xl font-bold text-gray-900 mb-4'>Description History</h2>
        <div className='space-y-4'>
          {productDetail.descriptionHistories?.map((desc, idx) => (
            <div key={idx} className='border-l-4 border-blue-500 pl-4 py-2'>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-sm text-gray-500'>
                  {formatReadableDate(desc.createdAt)}
                </span>
              </div>
              <div className='prose prose-sm max-w-none'>
                {renderRichText(desc?.description || '')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Description */}
      <div className='bg-white rounded-lg shadow-md p-6'>
        <h2 className='text-xl font-bold text-gray-900 mb-4'>Add New Description</h2>
        <div>
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Description
            </label>
            <RichTextEditor
              value={newDescription}
              onChange={setNewDescription}
              placeholder='Enter detailed product description...'
            />
          </div>
          <Button
            onClick={handleSubmitDescription}
            disabled={!newDescription.trim() || addProductDescription.isPending}>
            <Plus className='h-4 w-4' />
            {addProductDescription.isPending ? 'Adding...' : 'Add Description'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default EditProductPage
