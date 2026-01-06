/* eslint-disable @typescript-eslint/no-explicit-any */
import { Clock, Gavel, Heart, Package, ShoppingCart, User, Info } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { BidStatusBadge } from '@/components/ui/bid-status-badge'
import { BidHistoryTable } from '@/components/ui/bid-history'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  CreateQuestionNode,
  ProductQuestionTree,
} from '@/components/ui/product-question-tree'
import { Spinner } from '@/components/ui/spinner'
import { QUERY_KEYS } from '@/constants/queryKey'
import { useAuth } from '@/hooks/use-auth'
import { useAddToWatchList, useRemoveFromWatchList } from '@/hooks/use-watchlist'
import { renderRichText } from '@/lib/renderRichText'
import {
  formatPrice,
  formatReadableDate,
  getProductStatusColor,
  getTimeRemaining,
  getTimeUntilStart,
  getAuctionStatus,
  handleApiError,
} from '@/lib/utils'
import { ProductAPI } from '@/services/api/product.api'
import { OrderAPI } from '@/services/api/order.api'
import { BidAPI } from '@/services/api/bid.api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type {
  QuestionActions,
  QuestionMutationState,
  QuestionUIState,
} from '@/components/ui/product-question-tree'

import type { Product } from '@/types/product.type'
import type { BidHistoryItem, UserBidStatus } from '@/types/bid.type'

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const [selectedImage, setSelectedImage] = useState(0)
  const [bidAmount, setBidAmount] = useState(0)
  const [replyingToId, setReplyingToId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Auto-bidding states
  const [isAutoBidMode, setIsAutoBidMode] = useState(false)
  const [startingBid, setStartingBid] = useState(0)
  const [maxBid, setMaxBid] = useState(0)
  const [confirmAutoBid, setConfirmAutoBid] = useState(false)
  const [countdown, setCountdown] = useState<string | null>(null)

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

  const product = productDetailQuery.data

  // No automatic redirect - only redirect when order exists
  // Order is only created after payment is completed

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

  // Bid history query
  const bidHistoryQuery = useQuery<BidHistoryItem[]>({
    queryKey: QUERY_KEYS.bids.history(productId ?? ''),
    queryFn: async () => {
      const response = await BidAPI.getProductBidHistory({
        variables: { productId: productId! },
      })
      return response.data
    },
    enabled: !!productId && product?.status === 'ACTIVE',
    refetchInterval: 5000, // Refresh every 5 seconds
  })

  // User bid status query
  const userBidStatusQuery = useQuery<UserBidStatus>({
    queryKey: ['user-bid-status', productId],
    queryFn: async () => {
      const response = await BidAPI.getUserBidStatus({
        variables: { productId: productId! },
      })
      return response.data
    },
    enabled: !!productId && isAuthenticated && product?.status === 'ACTIVE',
    refetchInterval: 5000,
  })

  // Bid validation query
  const bidValidationQuery = useQuery({
    queryKey: ['bid-validation', productId],
    queryFn: async () => {
      const response = await BidAPI.validateBid({
        variables: { productId: productId! },
        options: {
          params: {
            amount: product?.currentPrice ? product.currentPrice + product.priceStep : 0,
          },
        },
      })
      return response.data
    },
    enabled: !!productId && !!product,
    refetchInterval: 5000,
  })

  // Check if order exists for this product
  const orderCheckQuery = useQuery({
    queryKey: ['order-check', productId],
    queryFn: async () => {
      try {
        const response = await OrderAPI.getProductWithOrder({
          variables: { productId: productId! },
        })
        console.log('🔍 Order check response:', response.data)
        console.log('🔍 Order exists:', !!response.data?.order)
        console.log('🔍 Payment status:', response.data?.order?.paymentStatus)
        return response.data
      } catch (error) {
        console.log('❌ Order check failed:', error)
        return null
      }
    },
    enabled: !!productId && isAuthenticated && product?.status === 'COMPLETED',
    retry: false,
  })

  // Payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      const response = await OrderAPI.createPaymentOrder({
        variables: { productId: productId! },
      })
      return response.data
    },
    onSuccess: (data: any) => {
      // Store productId in localStorage (more persistent than sessionStorage)
      localStorage.setItem('pendingProductId', productId!)
      // Redirect to PayPal
      window.location.href = data.approvalUrl
    },
    onError: (error: any) => {
      handleApiError(error, 'Cannot create payment')
    },
  })

  const handlePayment = () => {
    createPaymentMutation.mutate()
  }

  // Buy Now payment mutation
  const createBuyNowPaymentMutation = useMutation({
    mutationFn: async () => {
      const response = await OrderAPI.createPaymentOrder({
        variables: { productId: productId! },
        options: {
          data: { productId: productId!, isBuyNow: true },
        },
      })
      return response.data
    },
    onSuccess: (data: any) => {
      // Store productId in localStorage
      localStorage.setItem('pendingProductId', productId!)
      localStorage.setItem('isBuyNow', 'true')
      // Redirect to PayPal
      window.location.href = data.approvalUrl
    },
    onError: (error: any) => {
      handleApiError(error, 'Cannot create Buy Now payment')
    },
  })

  const handleBuyNow = () => {
    if (!product?.buyNowPrice) return

    // Confirm dialog
    if (
      !window.confirm(
        `Bạn có chắc muốn mua ngay với giá ${formatPrice(product.buyNowPrice)}?`,
      )
    ) {
      return
    }

    createBuyNowPaymentMutation.mutate()
  }

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
    setDeletingId(id)
    deleteQuestionMutation.mutate(
      { questionId: id },
      {
        onSuccess: () => {
          setDeletingId(null)
        },
      },
    )
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

  // Place bid mutation
  const placeBidMutation = useMutation({
    mutationFn: async (data: {
      amount: number
      isProxy: boolean
      maxAmount?: number
    }) => {
      const response = await BidAPI.placeBid({
        options: {
          data: {
            productId: productId!,
            amount: data.amount,
            isProxy: data.isProxy,
            maxAmount: data.maxAmount,
            confirmed: true,
          },
        },
      })
      return response.data
    },
    onSuccess: (data: any) => {
      if (data.isWinning) {
        toast.success('Bid placed successfully! You are currently winning.')
      } else {
        toast.warning(
          `You've been outbid! Current price: ${formatPrice(data.currentPrice)}`,
        )
      }

      // Reset form
      setBidAmount(0)
      setStartingBid(0)
      setMaxBid(0)
      setConfirmAutoBid(false)

      // Refresh queries
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.bids.history(productId ?? ''),
      })
      queryClient.invalidateQueries({
        queryKey: ['user-bid-status', productId],
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.products.detail(productId ?? ''),
      })
    },
    onError: (err: any) => {
      handleApiError(err, 'Failed to place bid')
    },
  })

  // Handle manual bid
  const handleManualBid = () => {
    if (!bidAmount || bidAmount <= 0) {
      toast.error('Please enter a valid bid amount')
      return
    }

    const minBid = product!.currentPrice + product!.priceStep
    if (bidAmount < minBid) {
      toast.error(`Minimum bid is ${formatPrice(minBid)}`)
      return
    }

    placeBidMutation.mutate({
      amount: bidAmount,
      isProxy: false,
    })
  }

  // Handle auto bid
  const handleAutoBid = () => {
    if (!startingBid || !maxBid) {
      toast.error('Please enter both starting bid and maximum bid')
      return
    }

    const minBid = product!.currentPrice + product!.priceStep
    if (startingBid < minBid) {
      toast.error(`Starting bid must be at least ${formatPrice(minBid)}`)
      return
    }

    if (maxBid < startingBid) {
      toast.error('Maximum bid must be greater than or equal to starting bid')
      return
    }

    if (!confirmAutoBid) {
      toast.error('Please confirm that you understand how auto-bidding works')
      return
    }

    placeBidMutation.mutate({
      amount: startingBid,
      isProxy: true,
      maxAmount: maxBid,
    })
  }

  // Update minimum bid amounts when product changes
  useEffect(() => {
    if (product) {
      const minBid = product.currentPrice + product.priceStep
      setBidAmount(minBid)
      setStartingBid(minBid)
      setMaxBid(minBid)
    }
  }, [product])

  // Countdown timer for auction start
  useEffect(() => {
    if (!product?.startTime) return

    const updateCountdown = () => {
      const timeUntilStart = getTimeUntilStart(product.startTime)
      setCountdown(timeUntilStart)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [product?.startTime])

  const questionActions: QuestionActions = {
    updateContent: handleUpdateContent,
    addReply: handleAddReply,
    saveReply: handleSaveReply,
    cancelReply: handleCancelReply,
    delete: handleDelete,
  }

  const questionUI: QuestionUIState = {
    replyingToId,
    editingId,
    setEditingId,
    isAuthenticated,
  }

  const questionMutation: QuestionMutationState = {
    isSavingEditedContent: updateQuestionMutation.isPending,
    deletingId,
    isReplying: createQuestionMutation.isPending,
  }

  const isExistedInWatchList = checkExistedItemQuery?.data?.isFavorite

  console.log('Product Detail:', product)
  if (productDetailQuery.isPending)
    return (
      <>
        <div className='container mx-auto py-12'>
          <div className='text-center py-12'>
            <Button disabled size='lg'>
              <Spinner />
              Loading products...
            </Button>
          </div>
        </div>
      </>
    )

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
              <div className='flex gap-2'>
                <div className='inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full'>
                  {product.category.name}
                </div>

                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getProductStatusColor(product.status)}`}>
                  {product.status}
                </span>
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
                  <p className='font-semibold text-blue-700'>
                    {product.highestBidder.fullName}
                  </p>
                </div>
              </div>
            )}

            <div className='space-y-3 pt-4 border-t'>
              {/* Auction Status Badge */}
              {product.startTime &&
                (() => {
                  const auctionStatus = getAuctionStatus(
                    product.startTime,
                    product.endTime,
                  )

                  if (auctionStatus === 'NOT_STARTED') {
                    return (
                      <div className='bg-orange-50 border border-orange-200 rounded-lg p-4'>
                        <div className='flex items-center gap-2 text-orange-800'>
                          <Clock className='w-5 h-5' />
                          <div>
                            <p className='font-semibold'>Phiên đấu giá chưa bắt đầu</p>
                            {countdown && (
                              <p className='text-sm mt-1'>
                                Bắt đầu sau:{' '}
                                <span className='font-mono font-bold'>{countdown}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  }

                  if (auctionStatus === 'ACTIVE') {
                    return (
                      <div className='bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2'>
                        <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse' />
                        <span className='text-green-800 font-semibold text-sm'>
                          Đang diễn ra
                        </span>
                      </div>
                    )
                  }

                  return null
                })()}

              {/* User bid status */}
              {isAuthenticated &&
                product.status === 'ACTIVE' &&
                userBidStatusQuery.data && (
                  <BidStatusBadge
                    isWinning={userBidStatusQuery.data.isWinning}
                    remainingBudget={userBidStatusQuery.data.remainingBudget}
                  />
                )}

              {/* Logic for SELLER - Review order */}
              {product.status === 'COMPLETED' &&
                isAuthenticated &&
                user?.id === product.seller.id &&
                (orderCheckQuery.data?.order ? (
                  <button
                    onClick={() => {
                      navigate(`/seller/orders/${productId}/confirm`)
                    }}
                    className='w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 flex items-center justify-center gap-2'>
                    <Package className='w-5 h-5' />
                    Review Order
                  </button>
                ) : (
                  <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
                    <p className='text-gray-600 text-sm text-center'>
                      Waiting for buyer payment...
                    </p>
                  </div>
                ))}

              {/* Logic for BUYER - Payment and order tracking */}
              {product.status === 'COMPLETED' &&
                isAuthenticated &&
                user?.id === product.winnerId &&
                (orderCheckQuery.data?.order ? (
                  orderCheckQuery.data.order.paymentStatus === 'COMPLETED' ? (
                    <button
                      onClick={() => {
                        navigate(`/order/${orderCheckQuery.data.order.id}`)
                      }}
                      className='w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2'>
                      <Package className='w-5 h-5' />
                      Continue with Order
                    </button>
                  ) : (
                    <button
                      onClick={handlePayment}
                      disabled={createPaymentMutation.isPending}
                      className='w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                      <ShoppingCart className='w-5 h-5' />
                      {createPaymentMutation.isPending
                        ? 'Processing...'
                        : `Pay ${formatPrice(product.currentPrice)}`}
                    </button>
                  )
                ) : (
                  <button
                    onClick={handlePayment}
                    disabled={createPaymentMutation.isPending}
                    className='w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                    <ShoppingCart className='w-5 h-5' />
                    {createPaymentMutation.isPending
                      ? 'Processing...'
                      : `Pay ${formatPrice(product.currentPrice)}`}
                  </button>
                ))}

              {product.status === 'ACTIVE' && isAuthenticated ? (
                // Auction is active, show bid forms
                (() => {
                  const auctionStatus: 'NOT_STARTED' | 'ACTIVE' | 'ENDED' =
                    product.startTime
                      ? getAuctionStatus(product.startTime, product.endTime)
                      : 'ACTIVE'
                  const canBid =
                    auctionStatus === 'ACTIVE' &&
                    bidValidationQuery.data?.canBid !== false
                  const statusMessage = bidValidationQuery.data?.message

                  if (auctionStatus === 'NOT_STARTED') {
                    return (
                      <div className='space-y-3'>
                        <Button disabled className='w-full'>
                          <Clock className='w-5 h-5 mr-2' />
                          Chưa bắt đầu
                        </Button>
                        {product.buyNowPrice && (
                          <Button disabled className='w-full'>
                            <ShoppingCart className='w-5 h-5 mr-2' />
                            Mua ngay - Chưa bắt đầu
                          </Button>
                        )}
                      </div>
                    )
                  }

                  return (
                    <>
                      {/* Toggle between Manual and Auto Bid */}
                      <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
                        <div className='flex items-center gap-2'>
                          <Label htmlFor='auto-bid-mode' className='font-medium'>
                            {isAutoBidMode ? 'Auto Bidding' : 'Manual Bidding'}
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className='w-4 h-4 text-gray-500' />
                              </TooltipTrigger>
                              <TooltipContent className='max-w-xs'>
                                <p>
                                  {isAutoBidMode
                                    ? "The system will automatically increase your bid to outbid competitors, using only what's necessary from your maximum budget."
                                    : 'You manually enter and submit each bid amount.'}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Switch
                          id='auto-bid-mode'
                          checked={isAutoBidMode}
                          onCheckedChange={setIsAutoBidMode}
                        />
                      </div>

                      {!isAutoBidMode ? (
                        // Manual Bid Form
                        <div className='space-y-3'>
                          <div className='flex items-center gap-3'>
                            <input
                              type='number'
                              value={bidAmount}
                              onChange={e => setBidAmount(Number(e.target.value))}
                              step={product.priceStep}
                              min={product.currentPrice + product.priceStep}
                              className='flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                              placeholder={`Min: ${formatPrice(product.currentPrice + product.priceStep)}`}
                            />
                            <Button
                              onClick={handleManualBid}
                              disabled={placeBidMutation.isPending || !canBid}
                              className='px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed'>
                              <Gavel className='w-5 h-5' />
                              {!canBid && statusMessage
                                ? statusMessage
                                : placeBidMutation.isPending
                                  ? 'Placing...'
                                  : 'Place bid'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Auto Bid Form
                        <div className='space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200'>
                          <div className='space-y-2'>
                            <Label htmlFor='starting-bid'>Starting Bid</Label>
                            <input
                              id='starting-bid'
                              type='number'
                              value={startingBid}
                              onChange={e => setStartingBid(Number(e.target.value))}
                              step={product.priceStep}
                              min={product.currentPrice + product.priceStep}
                              className='w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                              placeholder={`Min: ${formatPrice(product.currentPrice + product.priceStep)}`}
                            />
                          </div>

                          <div className='space-y-2'>
                            <Label htmlFor='max-bid'>Maximum Bid</Label>
                            <input
                              id='max-bid'
                              type='number'
                              value={maxBid}
                              onChange={e => setMaxBid(Number(e.target.value))}
                              step={product.priceStep}
                              min={startingBid}
                              className='w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                              placeholder={`Min: ${formatPrice(startingBid)}`}
                            />
                          </div>

                          <div className='flex items-start gap-2 p-3 bg-white rounded border border-blue-300'>
                            <Info className='w-5 h-5 text-blue-600 mt-0.5 shrink-0' />
                            <p className='text-sm text-gray-700'>
                              The system will automatically increase your bid to outbid
                              competitors, using only what's necessary from your maximum
                              budget.
                            </p>
                          </div>

                          <div className='flex items-center gap-2'>
                            <Checkbox
                              id='confirm-auto-bid'
                              checked={confirmAutoBid}
                              onCheckedChange={(checked: boolean) =>
                                setConfirmAutoBid(checked)
                              }
                            />
                            <Label
                              htmlFor='confirm-auto-bid'
                              className='text-sm cursor-pointer'>
                              I understand how auto-bidding works
                            </Label>
                          </div>

                          <Button
                            onClick={handleAutoBid}
                            disabled={
                              placeBidMutation.isPending || !confirmAutoBid || !canBid
                            }
                            className='w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed'>
                            {!canBid && statusMessage
                              ? statusMessage
                              : placeBidMutation.isPending
                                ? 'Activating...'
                                : 'Activate Auto Bidding'}
                          </Button>
                        </div>
                      )}

                      {product.buyNowPrice && (
                        <button
                          onClick={handleBuyNow}
                          disabled={
                            auctionStatus === 'NOT_STARTED' ||
                            createBuyNowPaymentMutation.isPending
                          }
                          className='w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed'>
                          <ShoppingCart className='w-5 h-5' />
                          {createBuyNowPaymentMutation.isPending
                            ? 'Processing...'
                            : auctionStatus === 'NOT_STARTED'
                              ? 'Chưa bắt đầu'
                              : `Buy now ${formatPrice(product.buyNowPrice)}`}
                        </button>
                      )}
                    </>
                  )
                })()
              ) : product.status === 'ACTIVE' && !isAuthenticated ? (
                <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                  <p className='text-blue-800 text-sm text-center'>
                    Please{' '}
                    <button
                      onClick={() => navigate('/login')}
                      className='font-semibold underline hover:text-blue-900'>
                      login
                    </button>{' '}
                    to place a bid
                  </p>
                </div>
              ) : product.status === 'COMPLETED' ? (
                // Auction completed but user is not the winner
                <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
                  <p className='text-yellow-800 text-sm'>
                    This auction has ended. Winner:{' '}
                    <span className='font-semibold'>
                      {product.highestBidder?.fullName || 'Unknown'}
                    </span>
                  </p>
                </div>
              ) : null}
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
                <p className='font-semibold'>{product.seller?.fullName}</p>
                <p className='text-sm text-gray-600'>
                  ID: {product.seller.id.slice(0, 8)}...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-8'>
        <div className='bg-white rounded-lg p-6'>
          <h2 className='text-2xl font-bold mb-4'>Bid History</h2>
          {bidHistoryQuery.isLoading ? (
            <div className='text-center py-8'>
              <Button disabled size='lg'>
                <Spinner />
                Loading bid history...
              </Button>
            </div>
          ) : (
            <BidHistoryTable bidHistory={bidHistoryQuery.data} currentUserId={user?.id} />
          )}
        </div>
        <div className=''>
          <div className='mt-8 bg-white rounded-lg'>
            <h2 className='text-2xl font-bold mb-4'>Product description</h2>

            <div className='flex flex-col gap-4'>
              {product.descriptionHistories.length > 0 ? (
                product.descriptionHistories.map((history, index) => (
                  <Card key={index} className='w-full'>
                    <CardHeader className='text-sm text-gray-500 space-y-1'>
                      <div>
                        <span className='font-medium'>Created:</span>{' '}
                        {formatReadableDate(history.createdAt)}
                      </div>
                      <div>
                        {history?.updatedAt && (
                          <>
                            <span className='font-medium'>Updated:</span>
                            {formatReadableDate(history.updatedAt)}
                          </>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className='prose max-w-none'>
                      {renderRichText(history.description)}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className='text-gray-500'>No description history found.</p>
              )}
            </div>
          </div>
          <div className='mt-8 bg-white rounded-lg'>
            <h2 className='text-2xl font-bold mb-4'>Product Q&A</h2>
            {productQuestionsQuery.isLoading ? (
              <p className='text-gray-500'>
                <Button disabled size='lg'>
                  <Spinner />
                  Loading questions...
                </Button>
              </p>
            ) : productQuestionsQuery.isError ? (
              <p className='text-red-500'>Error loading questions</p>
            ) : (
              <>
                {isAuthenticated && (
                  <CreateQuestionNode
                    user={user}
                    onCreateQuestion={handleCreateQuestion}
                    isCreating={createQuestionMutation.isPending}
                    isSuccessful={createQuestionMutation.isSuccess}
                  />
                )}

                <ProductQuestionTree
                  questions={productQuestionsQuery.data || []}
                  actions={questionActions}
                  ui={questionUI}
                  mutation={questionMutation}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
