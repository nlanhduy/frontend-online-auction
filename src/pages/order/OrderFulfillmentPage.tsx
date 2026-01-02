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

import { OrderStatusProgress } from '@/components/ui/order-status-progress'
import { RatingForm } from '@/components/ui/rating-form'
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
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { QUERY_KEYS } from '@/constants/queryKey'
import { useAuth } from '@/hooks/use-auth'
import { formatPrice, handleApiError } from '@/lib/utils'
import { OrderAPI } from '@/services/api/order.api'
import { OrderStatus } from '@/types/order.type'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type {
  ProductWithOrder,
  ShippingInfoRequest,
  ConfirmShipmentRequest,
} from '@/types/order.type'

const VIETNAM_CITIES = [
  'Hà Nội',
  'TP. Hồ Chí Minh',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'An Giang',
  'Bà Rịa - Vũng Tàu',
  'Bắc Giang',
  'Bắc Kạn',
  'Bạc Liêu',
  'Bắc Ninh',
  'Bến Tre',
  'Bình Định',
  'Bình Dương',
  'Bình Phước',
  'Bình Thuận',
  'Cà Mau',
  'Cao Bằng',
  'Đắk Lắk',
  'Đắk Nông',
  'Điện Biên',
  'Đồng Nai',
  'Đồng Tháp',
  'Gia Lai',
  'Hà Giang',
  'Hà Nam',
  'Hà Tĩnh',
  'Hải Dương',
  'Hậu Giang',
  'Hòa Bình',
  'Hưng Yên',
  'Khánh Hòa',
  'Kiên Giang',
  'Kon Tum',
  'Lai Châu',
  'Lâm Đồng',
  'Lạng Sơn',
  'Lào Cai',
  'Long An',
  'Nam Định',
  'Nghệ An',
  'Ninh Bình',
  'Ninh Thuận',
  'Phú Thọ',
  'Phú Yên',
  'Quảng Bình',
  'Quảng Nam',
  'Quảng Ngãi',
  'Quảng Ninh',
  'Quảng Trị',
  'Sóc Trăng',
  'Sơn La',
  'Tây Ninh',
  'Thái Bình',
  'Thái Nguyên',
  'Thanh Hóa',
  'Thừa Thiên Huế',
  'Tiền Giang',
  'Trà Vinh',
  'Tuyên Quang',
  'Vĩnh Long',
  'Vĩnh Phúc',
  'Yên Bái',
]

const SHIPPING_CARRIERS = [
  'Giao Hàng Nhanh',
  'Giao Hàng Tiết Kiệm',
  'J&T Express',
  'Viettel Post',
  'VNPost',
  'Ninja Van',
  'Best Express',
  'Kerry Express',
]

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
      toast.error('Vui lòng đăng nhập để xem trang này')
      navigate('/login')
      return
    }

    if (productData && productData.viewType === 'BASIC_INFO') {
      toast.info(productData.message || 'Sản phẩm đã kết thúc')
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
      handleApiError(error, 'Không thể tạo thanh toán')
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
      toast.success('Đã gửi địa chỉ giao hàng!')
      queryClient.invalidateQueries({
        queryKey: ['order', orderIdOrProductId],
      })
    },
    onError: (error: any) => {
      handleApiError(error, 'Không thể gửi địa chỉ')
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
      toast.success('Đã xác nhận gửi hàng!')
      queryClient.invalidateQueries({
        queryKey: ['order', orderIdOrProductId],
      })
    },
    onError: (error: any) => {
      handleApiError(error, 'Không thể xác nhận gửi hàng')
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
      toast.success('Đã xác nhận nhận hàng! Người bán sẽ nhận tiền trong vài phút.')
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.orders.productOrder(productId!),
      })
    },
    onError: (error: any) => {
      handleApiError(error, 'Không thể xác nhận nhận hàng')
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
      toast.success('Đã hủy giao dịch!')
      setCancelModalOpen(false)
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.orders.productOrder(productId!),
      })
    },
    onError: (error: any) => {
      handleApiError(error, 'Không thể hủy giao dịch')
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
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }
    submitShippingMutation.mutate(shippingForm)
  }

  const handleConfirmShipment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!shipmentForm.carrier || !shipmentForm.trackingNumber) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }
    confirmShipmentMutation.mutate(shipmentForm)
  }

  const handleConfirmReceived = () => {
    if (window.confirm('Bạn có chắc đã nhận được hàng và hài lòng với sản phẩm?')) {
      confirmReceivedMutation.mutate()
    }
  }

  const handleCancelOrder = () => {
    if (!cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy giao dịch')
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
            <h2 className='mt-4 text-xl font-semibold'>Không tìm thấy đơn hàng</h2>
            <p className='mt-2 text-gray-600'>
              {productData?.viewType === 'BASIC_INFO'
                ? 'Đơn hàng chưa được tạo. Vui lòng thử lại sau giây lát.'
                : 'Sản phẩm này chưa có đơn hàng hoặc bạn không có quyền truy cập.'}
            </p>
            <div className='mt-6 flex justify-center gap-3'>
              <Button variant='outline' onClick={() => refetch()}>
                Thử lại
              </Button>
              <Button onClick={() => navigate(`/product/${productId}`)}>
                Quay lại sản phẩm
              </Button>
            </div>
            {error && (
              <p className='mt-4 text-sm text-red-600'>
                Lỗi: {error instanceof Error ? error.message : 'Unknown error'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>Hoàn tất đơn hàng</h1>
        <p className='mt-2 text-gray-600'>
          Sản phẩm: <span className='font-semibold'>{productData?.name}</span>
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
                  Thanh toán đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='rounded-lg bg-blue-50 p-4'>
                  <p className='text-lg font-semibold text-blue-900'>
                    Số tiền: {formatPrice(order.paymentAmountVND)}
                  </p>
                  <p className='text-sm text-blue-700'>
                    (≈ ${order.paymentAmount.toFixed(2)} USD qua PayPal)
                  </p>
                </div>
                <Button
                  onClick={handlePayment}
                  disabled={createPaymentMutation.isPending}
                  className='w-full'>
                  {createPaymentMutation.isPending
                    ? 'Đang xử lý...'
                    : '💳 Thanh toán qua PayPal'}
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
                  Thông tin giao hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitShipping} className='space-y-4'>
                  <div>
                    <Label htmlFor='address'>Địa chỉ nhận hàng *</Label>
                    <Input
                      id='address'
                      placeholder='Số nhà, tên đường...'
                      value={shippingForm.address}
                      onChange={e =>
                        setShippingForm({ ...shippingForm, address: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className='grid gap-4 md:grid-cols-2'>
                    <div>
                      <Label htmlFor='city'>Tỉnh/Thành phố *</Label>
                      <select
                        id='city'
                        className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                        value={shippingForm.city}
                        onChange={e =>
                          setShippingForm({ ...shippingForm, city: e.target.value })
                        }
                        required>
                        <option value=''>Chọn Tỉnh/Thành phố</option>
                        {VIETNAM_CITIES.map(city => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor='district'>Quận/Huyện *</Label>
                      <Input
                        id='district'
                        placeholder='Nhập Quận/Huyện'
                        value={shippingForm.district}
                        onChange={e =>
                          setShippingForm({ ...shippingForm, district: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor='phone'>Số điện thoại *</Label>
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
                    <Label htmlFor='note'>Ghi chú</Label>
                    <Textarea
                      id='note'
                      placeholder='Ghi chú cho người bán (không bắt buộc)'
                      value={shippingForm.note}
                      onChange={e =>
                        setShippingForm({ ...shippingForm, note: e.target.value })
                      }
                      rows={3}
                    />
                  </div>

                  <Button type='submit' disabled={submitShippingMutation.isPending}>
                    {submitShippingMutation.isPending
                      ? 'Đang gửi...'
                      : 'Gửi địa chỉ giao hàng'}
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
                  Xác nhận gửi hàng
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Payment Info */}
                <div className='rounded-lg bg-green-50 p-4'>
                  <p className='flex items-center gap-2 font-semibold text-green-900'>
                    <CheckCircle className='h-5 w-5' />
                    Đã nhận thanh toán
                  </p>
                  <p className='mt-1 text-green-700'>
                    Số tiền: ${order.sellerAmount.toFixed(2)} USD
                  </p>
                  <p className='text-sm text-green-600'>
                    Bạn sẽ nhận tiền vào PayPal sau khi người mua xác nhận đã nhận hàng
                  </p>
                </div>

                {/* Shipping Address */}
                <div className='rounded-lg border p-4'>
                  <h4 className='mb-2 font-semibold'>📍 Địa chỉ giao hàng:</h4>
                  <p>{order.shippingAddress}</p>
                  <p>
                    {order.shippingDistrict}, {order.shippingCity}
                  </p>
                  <p className='mt-2'>📞 {order.shippingPhone}</p>
                  {order.shippingNote && (
                    <p className='mt-2 text-sm text-gray-600'>
                      💬 Ghi chú: {order.shippingNote}
                    </p>
                  )}
                </div>

                {/* Shipment Form */}
                <form onSubmit={handleConfirmShipment} className='space-y-4'>
                  <div>
                    <Label htmlFor='carrier'>Đơn vị vận chuyển *</Label>
                    <select
                      id='carrier'
                      className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                      value={shipmentForm.carrier}
                      onChange={e =>
                        setShipmentForm({ ...shipmentForm, carrier: e.target.value })
                      }
                      required>
                      <option value=''>Chọn đơn vị vận chuyển</option>
                      {SHIPPING_CARRIERS.map(carrier => (
                        <option key={carrier} value={carrier}>
                          {carrier}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor='trackingNumber'>Mã vận đơn *</Label>
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
                      ? 'Đang xử lý...'
                      : 'Xác nhận đã gửi hàng'}
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
                    Đơn hàng đang giao
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='rounded-lg border p-4'>
                    <p>
                      Đơn vị vận chuyển: <strong>{order.shippingCarrier}</strong>
                    </p>
                    <p className='mt-1'>
                      Mã vận đơn: <strong>{order.trackingNumber}</strong>
                    </p>
                    <p className='mt-1 text-sm text-gray-600'>
                      Ngày gửi: {new Date(order.shippedAt!).toLocaleDateString('vi-VN')}
                    </p>
                  </div>

                  <div className='rounded-lg bg-yellow-50 p-4'>
                    <p className='text-sm text-yellow-800'>
                      ⚠️ Vui lòng kiểm tra hàng kỹ lưỡng trước khi xác nhận nhận hàng
                    </p>
                  </div>

                  <Button
                    onClick={handleConfirmReceived}
                    disabled={confirmReceivedMutation.isPending}>
                    {confirmReceivedMutation.isPending
                      ? 'Đang xử lý...'
                      : '✅ Tôi đã nhận được hàng'}
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
              isLoading={createRatingMutation.isPending || updateRatingMutation.isPending}
            />
          )}
        </div>

        {/* Right Column - Summary */}
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Mã đơn:</span>
                <span className='font-mono text-xs'>{order.id.slice(0, 8)}...</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Giá sản phẩm:</span>
                <span className='font-semibold'>
                  {formatPrice(order.paymentAmountVND)}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Phí platform (5%):</span>
                <span>${order.platformFee.toFixed(2)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Người bán nhận:</span>
                <span className='font-semibold text-green-600'>
                  ${order.sellerAmount.toFixed(2)} USD
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Buyer/Seller Info */}
          <Card>
            <CardHeader>
              <CardTitle>{isBuyer ? 'Người bán' : 'Người mua'}</CardTitle>
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
                Hủy giao dịch
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
              Xác nhận hủy giao dịch
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn hủy giao dịch này? Người mua sẽ nhận điểm đánh giá -1.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <Label htmlFor='cancelReason'>Lý do hủy giao dịch *</Label>
              <Textarea
                id='cancelReason'
                placeholder='Vui lòng cho biết lý do...'
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
                {cancelOrderMutation.isPending ? 'Đang hủy...' : 'Xác nhận hủy'}
              </Button>
              <Button variant='outline' onClick={() => setCancelModalOpen(false)}>
                Quay lại
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
