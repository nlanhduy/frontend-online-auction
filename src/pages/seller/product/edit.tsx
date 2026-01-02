/* eslint-disable @typescript-eslint/no-explicit-any */
import { Plus } from 'lucide-react'
import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import RichTextEditor from '@/components/ui/ckeditor'
import { ProductCard } from '@/components/ui/product-card'
import { Spinner } from '@/components/ui/spinner'
import { QUERY_KEYS } from '@/constants/queryKey'
import { renderRichText } from '@/lib/renderRichText'
import { formatReadableDate, handleApiError } from '@/lib/utils'
import { ProductAPI } from '@/services/api/product.api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { Product } from '@/types/product.type'
const SellerProductEdit = () => {
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
      <ProductCard size='detail' product={productDetail} />
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

export default SellerProductEdit
