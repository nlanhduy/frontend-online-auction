/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AlertCircle,
  CheckCircle,
  CreditCard,
  MapPin,
  Package,
  ThumbsDown,
  Truck,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { StickyChatWidget } from '@/components/chat/sticky-chat-widget'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OrderStatusProgress } from '@/components/ui/order-status-progress'
import { RatingForm } from '@/components/ui/rating-form'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { QUERY_KEYS } from '@/constants/queryKey'
import { useAuth } from '@/hooks/use-auth'
import { formatPrice, handleApiError } from '@/lib/utils'
import { LocationAPI } from '@/services/api/location.api'
import { OrderAPI } from '@/services/api/order.api'
import { OrderStatus } from '@/types/order.type'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type {
  ProductWithOrder,
  ShippingInfoRequest,
  ConfirmShipmentRequest,
} from '@/types/order.type'
export default function OrderFulfillmentPage() {
  const { orderId: orderIdOrProductId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  // Shipping form state
  const [shippingForm, setShippingForm] = useState<ShippingInfoRequest>({
    address: '',
    city: '',
    district: '',
    phone: '',
    note: '',
  })

  // Seller confirmation form state
  const [shipmentForm, setShipmentForm] = useState<ConfirmShipmentRequest>({
    carrier: '',
    trackingNumber: '',
  })

  // Fetch provinces/cities from external API
  const provincesQuery = useQuery({
    queryKey: ['provinces'],
    queryFn: async () => {
      const data = await LocationAPI.getProvinces(1)
      return data
    },
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
  })

  // Fetch shipping carriers
  const carriersQuery = useQuery({
    queryKey: ['shipping-carriers'],
    queryFn: () => LocationAPI.getShippingCarriers(),
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
  })

  // Fetch order data by orderId
  const {
    data: productData,
    isLoading,
    error,
    refetch,
  } = useQuery<ProductWithOrder>({
    queryKey: ['order', orderIdOrProductId],
    queryFn: async () => {
      console.log('Fetching order with ID:', orderIdOrProductId)

      const response = await OrderAPI.getOrderById({
        variables: { orderId: orderIdOrProductId },
      })
      console.log('✅ Order by ID response:', response.data)

      // Map response: GET /orders/:orderId returns flat structure with Prisma relations
      const orderData = response.data

      // Extract product info (backend response has Product at top level or nested)
      const product = orderData.Product ||
        orderData.product || {
          id: orderData.productId,
          name: orderData.name || 'Product',
          description: orderData.description,
          currentPrice: orderData.paymentAmount * 24000, // Convert USD to VND approx
          ...orderData,
        }

      return {
        ...product, // Product fields at top level
        order: {
          id: orderData.id,
          productId: orderData.productId,
          status: orderData.status,
          paymentStatus: orderData.paymentStatus,
          paymentAmount: orderData.paymentAmount,
          paymentAmountVND: product.currentPrice || orderData.paymentAmount * 24000,
          paypalOrderId: orderData.paypalOrderId,
          paypalTransactionId: orderData.paypalTransactionId,
          paidAt: orderData.paidAt,
          platformFee: orderData.platformFee,
          sellerAmount: orderData.sellerAmount,
          sellerPaypalEmail: orderData.sellerPaypalEmail,
          payoutStatus: orderData.payoutStatus,
          shippingAddress: orderData.shippingAddress,
          shippingCity: orderData.shippingCity,
          shippingDistrict: orderData.shippingDistrict,
          shippingPhone: orderData.shippingPhone,
          shippingNote: orderData.shippingNote,
          shippingSubmittedAt: orderData.shippingSubmittedAt,
          sellerConfirmedAt: orderData.sellerConfirmedAt,
          trackingNumber: orderData.trackingNumber,
          shippingCarrier: orderData.shippingCarrier,
          shippedAt: orderData.shippedAt,
          buyerConfirmedAt: orderData.buyerConfirmedAt,
          receivedAt: orderData.receivedAt,
          isCancelled: orderData.isCancelled,
          cancelledAt: orderData.cancelledAt,
          cancelledBy: orderData.cancelledBy,
          cancellationReason: orderData.cancellationReason,
          buyer: orderData.User_Order_buyerIdToUser ||
            orderData.buyer || { id: orderData.buyerId },
          seller: orderData.User_Order_sellerIdToUser ||
            orderData.seller || { id: orderData.sellerId },
        },
        ratings: {
          buyerRating:
            orderData.Rating_Order_buyerRatingIdToRating || orderData.buyerRating,
          sellerRating:
            orderData.Rating_Order_sellerRatingIdToRating || orderData.sellerRating,
        },
      }
    },
    enabled: !!orderIdOrProductId && isAuthenticated,
    retry: 2, // Retry 2 times if order not found
    retryDelay: 1000, // Wait 1 second between retries
  })

  const order = productData?.order
  const productId = order?.productId || productData?.id || orderIdOrProductId
  const isBuyer = user?.id === order?.buyer?.id
  const isSeller = user?.id === order?.seller?.id

  // Redirect if not authorized
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to view this page')
      navigate('/login')
      return
    }

    if (productData && productData.viewType === 'BASIC_INFO') {
      toast.info(productData.message || 'Product has ended')
      navigate(`/product/${productId}`)
    }
  }, [isAuthenticated, productData, navigate, productId])

  // Payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      const response = await OrderAPI.createPaymentOrder({
        variables: { productId },
      })
      return response.data
    },
    onSuccess: (data: any) => {
      // Store productId for return from PayPal
      sessionStorage.setItem('payment_product_id', productId!)
      // Redirect to PayPal
      window.location.href = data.approvalUrl
    },
    onError: (error: any) => {
      handleApiError(error, 'Cannot create payment')
    },
  })

  // Submit shipping info mutation
  const submitShippingMutation = useMutation({
    mutationFn: async (data: ShippingInfoRequest) => {
      const response = await OrderAPI.submitShippingInfo({
        variables: { orderId: order?.id, data },
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('Shipping address submitted!')
      queryClient.invalidateQueries({
        queryKey: ['order', orderIdOrProductId],
      })
    },
    onError: (error: any) => {
      handleApiError(error, 'Cannot submit address')
    },
  })

  // Confirm shipment mutation
  const confirmShipmentMutation = useMutation({
    mutationFn: async (data: ConfirmShipmentRequest) => {
      const response = await OrderAPI.confirmShipment({
        variables: { orderId: order?.id, data },
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('Shipment confirmed!')
      queryClient.invalidateQueries({
        queryKey: ['order', orderIdOrProductId],
      })
    },
    onError: (error: any) => {
      handleApiError(error, 'Cannot confirm shipment')
    },
  })

  // Confirm received mutation
  const confirmReceivedMutation = useMutation({
    mutationFn: async () => {
      const response = await OrderAPI.confirmReceived({
        variables: { orderId: order?.id },
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('Receipt confirmed! Seller will receive payment in a few minutes.')
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.orders.productOrder(productId!),
      })
    },
    onError: (error: any) => {
      handleApiError(error, 'Cannot confirm receipt')
    },
  })

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: async (reason: string) => {
      const response = await OrderAPI.cancelOrder({
        variables: { orderId: order?.id, reason },
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('Transaction cancelled!')
      setCancelModalOpen(false)
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.orders.productOrder(productId!),
      })
    },
    onError: (error: any) => {
      handleApiError(error, 'Cannot cancel transaction')
    },
  })

  // Rating mutations
  const createRatingMutation = useMutation({
    mutationFn: async (data: { receiverId: string; value: number; comment?: string }) => {
      const response = await OrderAPI.createRating({
        variables: { data },
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.orders.productOrder(productId!),
      })
    },
  })

  const updateRatingMutation = useMutation({
    mutationFn: async (data: { ratingId: string; value: number; comment?: string }) => {
      const response = await OrderAPI.updateRating({
        variables: {
          ratingId: data.ratingId,
          data: { value: data.value, comment: data.comment },
        },
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.orders.productOrder(productId!),
      })
    },
  })

  const handlePayment = () => {
    createPaymentMutation.mutate()
  }

  const handleSubmitShipping = (e: React.FormEvent) => {
    e.preventDefault()
    if (!shippingForm.address || !shippingForm.city || !shippingForm.phone) {
      toast.error('Please fill in all required fields')
      return
    }
    submitShippingMutation.mutate(shippingForm)
  }

  const handleConfirmShipment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!shipmentForm.carrier || !shipmentForm.trackingNumber) {
      toast.error('Please fill in all information')
      return
    }
    confirmShipmentMutation.mutate(shipmentForm)
  }

  const handleConfirmReceived = () => {
    if (
      window.confirm('Are you sure you have received the item and are satisfied with it?')
    ) {
      confirmReceivedMutation.mutate()
    }
  }

  const handleCancelOrder = () => {
    if (!cancelReason.trim()) {
      toast.error('Please enter cancellation reason')
      return
    }
    cancelOrderMutation.mutate(cancelReason)
  }

  const handleRating = async (data: { value: number; comment?: string }) => {
    const receiverId = isBuyer ? order?.seller.id : order?.buyer.id
    const existingRating = isBuyer
      ? productData?.ratings?.buyerRating
      : productData?.ratings?.sellerRating

    if (existingRating) {
      await updateRatingMutation.mutateAsync({
        ratingId: existingRating.id,
        ...data,
      })
    } else {
      await createRatingMutation.mutateAsync({
        receiverId: receiverId!,
        ...data,
      })
    }
  }

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Spinner />
      </div>
    )
  }

  if (!order) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <Card>
          <CardContent className='py-12 text-center'>
            <AlertCircle className='mx-auto h-12 w-12 text-yellow-500' />
            <h2 className='mt-4 text-xl font-semibold'>Order not found</h2>
            <p className='mt-2 text-gray-600'>
              {productData?.viewType === 'BASIC_INFO'
                ? 'Order has not been created yet. Please try again in a moment.'
                : 'This product has no order or you do not have access.'}
            </p>
            <div className='mt-6 flex justify-center gap-3'>
              <Button variant='outline' onClick={() => refetch()}>
                Try again
              </Button>
              <Button onClick={() => navigate(`/product/${productId}`)}>
                Back to product
              </Button>
            </div>
            {error && (
              <p className='mt-4 text-sm text-red-600'>
                Error: {error instanceof Error ? error.message : 'Unknown error'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <StickyChatWidget orderId={order.id} />
      <div className='container mx-auto px-4 py-8'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold'>Complete Order</h1>
          <p className='mt-2 text-gray-600'>
            Product: <span className='font-semibold'>{productData?.name}</span>
          </p>
        </div>

        {/* Progress Bar */}
        <OrderStatusProgress currentStatus={order.status} />

        {/* Main Content */}
        <div className='mt-8 grid gap-6 lg:grid-cols-3'>
          {/* Left Column - Order Info */}
          <div className='space-y-6 lg:col-span-2'>
            {/* Payment Section */}
            {order.status === OrderStatus.PAYMENT_PENDING && isBuyer && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <CreditCard className='h-5 w-5' />
                    Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='rounded-lg bg-blue-50 p-4'>
                    <p className='text-lg font-semibold text-blue-900'>
                      Amount: {formatPrice(order.paymentAmountVND)}
                    </p>
                    <p className='text-sm text-blue-700'>
                      (≈ ${order.paymentAmount.toFixed(2)} USD via PayPal)
                    </p>
                  </div>
                  <Button
                    onClick={handlePayment}
                    disabled={createPaymentMutation.isPending}
                    className='w-full'>
                    {createPaymentMutation.isPending
                      ? 'Processing...'
                      : '💳 Pay via PayPal'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Shipping Form */}
            {order.status === OrderStatus.SHIPPING_INFO_PENDING && isBuyer && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <MapPin className='h-5 w-5' />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitShipping} className='space-y-4'>
                    <div>
                      <Label htmlFor='address'>Shipping Address *</Label>
                      <Input
                        id='address'
                        placeholder='House number, street...'
                        value={shippingForm.address}
                        onChange={e =>
                          setShippingForm({ ...shippingForm, address: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className='grid gap-4 md:grid-cols-2'>
                      <div>
                        <Label htmlFor='city'>Province/City *</Label>
                        <select
                          id='city'
                          className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                          value={shippingForm.city}
                          onChange={e =>
                            setShippingForm({ ...shippingForm, city: e.target.value })
                          }
                          required
                          disabled={provincesQuery.isLoading}>
                          <option value=''>
                            {provincesQuery.isLoading
                              ? 'Loading...'
                              : 'Select Province/City'}
                          </option>
                          {provincesQuery.data?.map(province => (
                            <option key={province.code} value={province.name}>
                              {province.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label htmlFor='district'>District *</Label>
                        <Input
                          id='district'
                          placeholder='Enter District'
                          value={shippingForm.district}
                          onChange={e =>
                            setShippingForm({ ...shippingForm, district: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor='phone'>Phone Number *</Label>
                      <Input
                        id='phone'
                        type='tel'
                        placeholder='0909123456'
                        value={shippingForm.phone}
                        onChange={e =>
                          setShippingForm({ ...shippingForm, phone: e.target.value })
                        }
                        pattern='[0-9]{10}'
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor='note'>Note</Label>
                      <Textarea
                        id='note'
                        placeholder='Note for seller (optional)'
                        value={shippingForm.note}
                        onChange={e =>
                          setShippingForm({ ...shippingForm, note: e.target.value })
                        }
                        rows={3}
                      />
                    </div>

                    <Button type='submit' disabled={submitShippingMutation.isPending}>
                      {submitShippingMutation.isPending
                        ? 'Submitting...'
                        : 'Submit Shipping Address'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Seller Confirmation Form */}
            {order.status === OrderStatus.SELLER_CONFIRMATION_PENDING && isSeller && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Package className='h-5 w-5' />
                    Confirm Shipment
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {/* Payment Info */}
                  <div className='rounded-lg bg-green-50 p-4'>
                    <p className='flex items-center gap-2 font-semibold text-green-900'>
                      <CheckCircle className='h-5 w-5' />
                      Payment Received
                    </p>
                    <p className='mt-1 text-green-700'>
                      Amount: ${order.sellerAmount.toFixed(2)} USD
                    </p>
                    <p className='text-sm text-green-600'>
                      You will receive payment to PayPal after buyer confirms receipt
                    </p>
                  </div>

                  {/* Shipping Address */}
                  <div className='rounded-lg border p-4'>
                    <h4 className='mb-2 font-semibold'>📍 Shipping Address:</h4>
                    <p>{order.shippingAddress}</p>
                    <p>
                      {order.shippingDistrict}, {order.shippingCity}
                    </p>
                    <p className='mt-2'>📞 {order.shippingPhone}</p>
                    {order.shippingNote && (
                      <p className='mt-2 text-sm text-gray-600'>
                        💬 Note: {order.shippingNote}
                      </p>
                    )}
                  </div>

                  {/* Shipment Form */}
                  <form onSubmit={handleConfirmShipment} className='space-y-4'>
                    <div>
                      <Label htmlFor='carrier'>Shipping Carrier *</Label>
                      <select
                        id='carrier'
                        className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                        value={shipmentForm.carrier}
                        onChange={e =>
                          setShipmentForm({ ...shipmentForm, carrier: e.target.value })
                        }
                        required
                        disabled={carriersQuery.isLoading}>
                        <option value=''>
                          {carriersQuery.isLoading ? 'Loading...' : 'Select Carrier'}
                        </option>
                        {carriersQuery.data?.map(carrier => (
                          <option key={carrier} value={carrier}>
                            {carrier}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor='trackingNumber'>Tracking Number *</Label>
                      <Input
                        id='trackingNumber'
                        placeholder='VN123456789'
                        value={shipmentForm.trackingNumber}
                        onChange={e =>
                          setShipmentForm({
                            ...shipmentForm,
                            trackingNumber: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <Button type='submit' disabled={confirmShipmentMutation.isPending}>
                      {confirmShipmentMutation.isPending
                        ? 'Processing...'
                        : 'Confirm Shipment'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Tracking Info */}
            {(order.status === OrderStatus.IN_TRANSIT ||
              order.status === OrderStatus.BUYER_CONFIRMATION_PENDING) &&
              isBuyer && (
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <Truck className='h-5 w-5' />
                      Order In Transit
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='rounded-lg border p-4'>
                      <p>
                        Carrier: <strong>{order.shippingCarrier}</strong>
                      </p>
                      <p className='mt-1'>
                        Tracking Number: <strong>{order.trackingNumber}</strong>
                      </p>
                      <p className='mt-1 text-sm text-gray-600'>
                        Shipped: {new Date(order.shippedAt!).toLocaleDateString('en-US')}
                      </p>
                    </div>

                    <div className='rounded-lg bg-yellow-50 p-4'>
                      <p className='text-sm text-yellow-800'>
                        ⚠️ Please inspect the item carefully before confirming receipt
                      </p>
                    </div>

                    <Button
                      onClick={handleConfirmReceived}
                      disabled={confirmReceivedMutation.isPending}>
                      {confirmReceivedMutation.isPending
                        ? 'Processing...'
                        : '✅ I have received the item'}
                    </Button>
                  </CardContent>
                </Card>
              )}

            {/* Rating Section */}
            {order.status === OrderStatus.COMPLETED && (
              <RatingForm
                targetUser={isBuyer ? order.seller : order.buyer}
                userType={isBuyer ? 'buyer' : 'seller'}
                existingRating={
                  isBuyer
                    ? productData?.ratings?.buyerRating
                    : productData?.ratings?.sellerRating
                }
                onSubmit={handleRating}
                isLoading={
                  createRatingMutation.isPending || updateRatingMutation.isPending
                }
              />
            )}
          </div>

          {/* Right Column - Summary */}
          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Order Information</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Order ID:</span>
                  <span className='font-mono text-xs'>{order.id.slice(0, 8)}...</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Product Price:</span>
                  <span className='font-semibold'>
                    {formatPrice(order.paymentAmountVND)}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Platform Fee (5%):</span>
                  <span>${order.platformFee.toFixed(2)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Seller Receives:</span>
                  <span className='font-semibold text-green-600'>
                    ${order.sellerAmount.toFixed(2)} USD
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Buyer/Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle>{isBuyer ? 'Seller' : 'Buyer'}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='font-semibold'>
                  {isBuyer ? order.seller.fullName : order.buyer.fullName}
                </p>
                <p className='text-sm text-gray-600'>
                  {isBuyer ? order.seller.email : order.buyer.email}
                </p>
              </CardContent>
            </Card>

            {/* Cancel Button for Seller */}
            {isSeller &&
              order.status !== OrderStatus.COMPLETED &&
              order.status !== OrderStatus.CANCELLED && (
                <Button
                  variant='destructive'
                  className='w-full'
                  onClick={() => setCancelModalOpen(true)}>
                  <X className='mr-2 h-4 w-4' />
                  Cancel Transaction
                </Button>
              )}
          </div>
        </div>

        {/* Cancel Order Modal */}
        <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <ThumbsDown className='h-5 w-5 text-red-500' />
                Confirm Cancellation
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this transaction? The buyer will receive a
                -1 rating.
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div>
                <Label htmlFor='cancelReason'>Cancellation Reason *</Label>
                <Textarea
                  id='cancelReason'
                  placeholder='Please provide reason...'
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  rows={4}
                  required
                />
              </div>
              <div className='flex gap-2'>
                <Button
                  variant='destructive'
                  onClick={handleCancelOrder}
                  disabled={cancelOrderMutation.isPending}>
                  {cancelOrderMutation.isPending
                    ? 'Cancelling...'
                    : 'Confirm Cancellation'}
                </Button>
                <Button variant='outline' onClick={() => setCancelModalOpen(false)}>
                  Go Back
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
