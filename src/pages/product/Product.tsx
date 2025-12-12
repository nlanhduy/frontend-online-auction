/* eslint-disable @typescript-eslint/no-explicit-any */
import { Clock, Gavel, Heart, Package, ShoppingCart, User } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'

import {
  CreateQuestionNode,
  ProductQuestionTree,
} from '@/components/ui/product-question-tree'
import { QUERY_KEYS } from '@/constants/queryKey'
import { useAuth } from '@/hooks/use-auth'
import { useAddToWatchList, useRemoveFromWatchList } from '@/hooks/use-watchlist'
import { formatPrice, getTimeRemaining, handleApiError } from '@/lib/utils'
import { ProductAPI } from '@/services/api/product.api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { Product } from '@/types/product.type'
export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>()
  const [selectedImage, setSelectedImage] = useState(0)
  const [bidAmount, setBidAmount] = useState(0)
  const [replyingToId, setReplyingToId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const { isAuthenticated, user } = useAuth()
  const queryClient = useQueryClient()

  const productDetailQuery = useQuery<Product>({
    queryKey: QUERY_KEYS.products.detail(productId ?? ''),
    queryFn: async () => {
      const response = await ProductAPI.getProductDetail({
        variables: { productId: productId! },
      })

      return response.data
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
  })

  const checkExistedItemQuery = useQuery({
    queryKey: QUERY_KEYS.watchList.check(productId ?? ''),
    queryFn: async () => {
      const response = await ProductAPI.checkExistedItemWatchList({
        variables: { productId: productId! },
      })
      return response.data
    },
    enabled: !!productId && isAuthenticated,
    staleTime: 1000 * 60 * 5,
  })

  const productQuestionsQuery = useQuery({
    queryKey: QUERY_KEYS.questions.list(productId ?? ''),
    queryFn: async () => {
      let response
      if (!isAuthenticated) {
        response = await ProductAPI.getPublicProductQuestions({
          variables: { productId: productId! },
        })
      } else {
        response = await ProductAPI.getAuthProductQuestions({
          variables: { productId: productId! },
        })
      }

      return response.data
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
  })

  const addToWatchList = useAddToWatchList()
  const removeFromWatchList = useRemoveFromWatchList()

  const handleAddToWatchList = () => {
    addToWatchList.mutate(product?.id ?? '')
  }

  const handleRemoveFromWatchList = () => {
    removeFromWatchList.mutate(product?.id ?? '')
  }

  // Create question mutation
  const createQuestionMutation = useMutation({
    mutationFn: async ({
      productId,
      content,
      parentId,
    }: {
      productId: string
      content: string
      parentId?: string | null
    }) => {
      const response = await ProductAPI.createProductQuestions({
        options: {
          data: {
            productId,
            content,
            parentId,
          },
        },
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('Create question successfully')
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.questions.list(productId ?? ''),
      })
      setReplyingToId(null)
    },
    onError: (err: any) => {
      handleApiError(err)
    },
  })

  const handleCreateQuestion = (content: string) => {
    if (!productId) return

    createQuestionMutation.mutate({
      productId,
      content,
      parentId: null,
    })
  }

  // Update question mutation
  const updateQuestionMutation = useMutation({
    mutationFn: async ({
      questionId,
      content,
    }: {
      questionId: string
      content: string
    }) => {
      const response = await ProductAPI.updateProductQuestions({
        variables: { questionId },
        options: {
          data: { content },
        },
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('Update question successfully')
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.questions.list(productId ?? ''),
      })
      setEditingId(null)
    },
    onError: (err: any) => {
      handleApiError(err)
    },
  })
  const deleteQuestionMutation = useMutation({
    mutationFn: async ({ questionId }: { questionId: string }) => {
      const response = await ProductAPI.deleteProductQuestions({
        variables: { questionId },
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('Delete question successfully')
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.questions.list(productId ?? ''),
      })
    },
    onError: (err: any) => {
      handleApiError(err)
    },
  })

  const handleUpdateContent = (id: string, newContent: string) => {
    updateQuestionMutation.mutate({
      questionId: id,
      content: newContent,
    })
  }

  const handleAddReply = (parentId: string) => {
    if (replyingToId === parentId) {
      setReplyingToId(null)
      return
    }
    setReplyingToId(parentId)
  }

  const handleDelete = (id: string) => {
    if (!id) return
    deleteQuestionMutation.mutate({ questionId: id })
  }

  const handleSaveReply = (parentId: string, content: string) => {
    if (!productId) return

    createQuestionMutation.mutate({
      productId,
      content,
      parentId,
    })
  }

  const handleCancelReply = () => {
    setReplyingToId(null)
  }

  const isExistedInWatchList = checkExistedItemQuery?.data?.isFavorite
  const product = productDetailQuery.data

  if (!product) return <></>

  return (
    <div className='container mx-auto py-12'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        <div className='space-y-4'>
          <div className='bg-white rounded-lg overflow-hidden border relative'>
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className='w-full h-[500px] object-cover'
            />
          </div>

          <div className='grid grid-cols-4 gap-2'>
            {product.images.map((img, idx) => (
              <button
                key={img}
                onClick={() => setSelectedImage(idx)}
                className={`border-2 rounded-lg overflow-hidden ${
                  selectedImage === idx ? 'border-blue-500' : 'border-gray-200'
                }`}>
                <img src={img} alt='' className='w-full h-20 object-cover' />
              </button>
            ))}
          </div>
        </div>

        <div className='space-y-6'>
          <div className='bg-white rounded-lg p-6 space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full'>
                {product.category.name}
              </div>

              {isAuthenticated && (
                <button
                  onClick={
                    isExistedInWatchList
                      ? handleRemoveFromWatchList
                      : handleAddToWatchList
                  }
                  className={`flex items-center gap-2 text-sm font-medium ${
                    isExistedInWatchList
                      ? 'text-red-600 hover:text-red-700'
                      : 'text-gray-700 hover:text-red-600'
                  }`}>
                  <Heart
                    className={`w-4 h-4 ${isExistedInWatchList ? 'fill-red-500' : ''}`}
                  />
                  {isExistedInWatchList ? 'Remove from watch list' : 'Add to watch list'}
                </button>
              )}
            </div>

            <h1 className='text-3xl font-bold text-gray-900'>{product.name}</h1>

            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                product.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
              {product.status === 'ACTIVE' ? 'Auction in progress' : product.status}
            </span>

            <div className='space-y-3 pt-4 border-t'>
              <div>
                <p className='text-sm text-gray-600 mb-1'>Current price</p>
                <p className='text-4xl font-bold text-red-600'>
                  {formatPrice(product.currentPrice)}
                </p>
              </div>

              {product.buyNowPrice && (
                <div className='flex items-center gap-3'>
                  <p className='text-sm text-gray-600'>Buy now price:</p>
                  <p className='text-xl font-semibold text-green-600'>
                    {formatPrice(product.buyNowPrice)}
                  </p>
                </div>
              )}

              <div className='flex items-center gap-3 text-sm text-gray-600'>
                <p>Bid increment:</p>
                <p className='font-semibold'>{formatPrice(product.priceStep)}</p>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4 pt-4 border-t'>
              <div className='flex items-center gap-2 text-orange-600'>
                <Clock className='w-5 h-5' />
                <div>
                  <p className='text-xs text-gray-600'>Time remaining</p>
                  <p className='font-semibold'>{getTimeRemaining(product.endTime)}</p>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <Gavel className='w-5 h-5 text-blue-600' />
                <div>
                  <p className='text-xs text-gray-600'>Total bids</p>
                  <p className='font-semibold'>{product.totalBids}</p>
                </div>
              </div>
            </div>

            {product.highestBidder && (
              <div className='bg-blue-50 rounded-lg p-4 flex items-center gap-3'>
                <User className='w-5 h-5 text-blue-600' />
                <div>
                  <p className='text-sm text-gray-600'>Highest bidder</p>
                  <p className='font-semibold text-blue-700'>{product.highestBidder}</p>
                </div>
              </div>
            )}

            <div className='space-y-3 pt-4 border-t'>
              <div className='flex items-center gap-3'>
                <input
                  type='number'
                  value={bidAmount}
                  onChange={e => setBidAmount(Number(e.target.value))}
                  step={product.priceStep}
                  min={product.currentPrice + product.priceStep}
                  className='flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                <button className='px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2'>
                  <Gavel className='w-5 h-5' />
                  Place bid
                </button>
              </div>

              {product.buyNowPrice && (
                <button className='w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2'>
                  <ShoppingCart className='w-5 h-5' />
                  Buy now {formatPrice(product.buyNowPrice)}
                </button>
              )}
            </div>
          </div>

          <div className='bg-white rounded-lg p-6'>
            <h3 className='font-semibold text-lg mb-4 flex items-center gap-2'>
              <Package className='w-5 h-5' />
              Seller information
            </h3>

            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center'>
                <User className='w-6 h-6 text-blue-600' />
              </div>
              <div>
                <p className='font-semibold'>{product.seller.fullName}</p>
                <p className='text-sm text-gray-600'>
                  ID: {product.seller.id.slice(0, 8)}...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='mt-8 bg-white rounded-lg p-6'>
        <h2 className='text-2xl font-bold mb-4'>Product description</h2>
        <p className='text-gray-700 leading-relaxed'>{product.description}</p>

        {product.descriptionHistory.length > 0 && (
          <div className='mt-4 pt-4 border-t'>
            <p className='text-sm text-gray-600 font-semibold mb-2'>Update history:</p>
            <ul className='list-disc list-inside text-sm text-gray-600'>
              {product.descriptionHistory.map((history, idx) => (
                <li key={idx}>{history}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className='mt-8 bg-white rounded-lg p-6'>
        <h2 className='text-2xl font-bold mb-4'>Product Q&A</h2>
        {productQuestionsQuery.isLoading ? (
          <p className='text-gray-500'>Loading questions...</p>
        ) : productQuestionsQuery.isError ? (
          <p className='text-red-500'>Error loading questions</p>
        ) : (
          <>
            {(createQuestionMutation.isPending || updateQuestionMutation.isPending) && (
              <div className='mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm'>
                Saving changes...
              </div>
            )}

            {isAuthenticated && (
              <CreateQuestionNode user={user} onCreateQuestion={handleCreateQuestion} />
            )}

            <ProductQuestionTree
              questions={productQuestionsQuery.data || []}
              onUpdateContent={handleUpdateContent}
              onAddReply={handleAddReply}
              onSaveReply={handleSaveReply}
              onCancelReply={handleCancelReply}
              replyingToId={replyingToId}
              onDelete={handleDelete}
              editingId={editingId}
              setEditingId={setEditingId}
              isAuthenticated={isAuthenticated}
            />
          </>
        )}
      </div>
    </div>
  )
}
