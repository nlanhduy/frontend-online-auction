import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Package, Truck, XCircle, AlertCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { OrderStatusProgress } from '@/components/ui/order-status-progress'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { QUERY_KEYS } from '@/constants/queryKey'
import { useConfirmShipment } from '@/hooks/use-order'
import { OrderAPI } from '@/services/api/order.api'
import { ProductAPI } from '@/services/api/product.api'
import { OrderStatus } from '@/types/order.type'

export function SellerOrderConfirmationPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const [trackingNumber, setTrackingNumber] = useState('')
  const [shippingCarrier, setShippingCarrier] = useState('')
  const [cancellationReason, setCancellationReason] = useState('')
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  // Fetch order details
  const { data: orderData, isLoading: isLoadingOrder } = useQuery({
    queryKey: QUERY_KEYS.orders.productOrder(productId!),
    queryFn: async () => {
      const response = await OrderAPI.getProductWithOrder({
        variables: { productId: productId! },
      })
      console.log('🔍 SellerOrderConfirmationPage - Order API Response:', response.data)
      return response.data
    },
    enabled: !!productId,
  })

  // Fetch product details separately
  const { data: productData, isLoading: isLoadingProduct } = useQuery({
    queryKey: QUERY_KEYS.products.detail(productId!),
    queryFn: async () => {
      const response = await ProductAPI.getProductDetail({
        variables: { productId: productId! },
      })
      console.log('🔍 SellerOrderConfirmationPage - Product API Response:', response.data)
      return response.data
    },
    enabled: !!productId,
  })

  const order = orderData?.order
  const product = productData || orderData?.product

  console.log('📦 Order data:', order)
  console.log('📦 Product data:', product)
  console.log('📦 Has order:', !!order)

  const isLoading = isLoadingOrder || isLoadingProduct

  const confirmShipmentMutation = useConfirmShipment(order?.id || '', productId || '')

  const handleConfirmShipment = async () => {
    if (!trackingNumber || !shippingCarrier) {
      alert('Vui lòng nhập đầy đủ thông tin vận chuyển')
      return
    }

    try {
      await confirmShipmentMutation.mutateAsync({
        trackingNumber,
        carrier: shippingCarrier,
      })
      navigate('/seller/completed-auctions')
    } catch (error) {
      console.error('Error confirming shipment:', error)
    }
  }

  const handleCancelOrder = async () => {
    if (!cancellationReason.trim()) {
      alert('Vui lòng nhập lý do hủy đơn')
      return
    }

    try {
      await OrderAPI.cancelOrder({
        variables: {
          orderId: order?.id,
          reason: cancellationReason,
        },
      })
      setShowCancelDialog(false)
      navigate('/seller/completed-auctions')
    } catch (error) {
      console.error('Error canceling order:', error)
      alert('Không thể hủy đơn hàng')
    }
  }

  if (isLoading) {
    return (
      <div className='container mx-auto py-12 text-center'>
        <Spinner />
        <p className='mt-4'>Đang tải thông tin đơn hàng...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className='container mx-auto py-12 text-center'>
        <AlertCircle className='w-16 h-16 mx-auto text-red-500 mb-4' />
        <h2 className='text-2xl font-bold mb-2'>Không tìm thấy sản phẩm</h2>
        <p className='text-gray-600 mb-4'>Product ID: {productId}</p>
        <Button onClick={() => navigate('/seller/completed-auctions')}>
          Quay lại danh sách
        </Button>
      </div>
    )
  }

  if (!order) {
    return (
      <div className='container mx-auto py-12 text-center'>
        <AlertCircle className='w-16 h-16 mx-auto text-yellow-500 mb-4' />
        <h2 className='text-2xl font-bold mb-2'>Chưa có đơn hàng</h2>
        <p className='text-gray-600 mb-4'>
          Đơn hàng chưa được tạo. Người mua có thể chưa thanh toán.
        </p>
        <div className='space-y-4'>
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto'>
            <p className='text-sm text-blue-800'>
              <strong>Sản phẩm:</strong> {product.name}
            </p>
            <p className='text-sm text-blue-800'>
              <strong>Trạng thái:</strong> {product.status}
            </p>
          </div>
          <Button onClick={() => navigate('/seller/completed-auctions')}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    )
  }

  const canConfirm = order.status === OrderStatus.SELLER_CONFIRMATION_PENDING
  const isCancelled = order.status === OrderStatus.CANCELLED

  return (
    <div className='container mx-auto py-12 max-w-4xl'>
      <div className='mb-8'>
        <Button variant='outline' onClick={() => navigate(-1)} className='mb-4'>
          ← Quay lại
        </Button>
        <h1 className='text-3xl font-bold mb-2'>Xác nhận đơn hàng</h1>
        <p className='text-gray-600'>
          Xác nhận và gửi thông tin vận chuyển cho người mua
        </p>
      </div>

      {/* Order Status Progress */}
      <div className='mb-8'>
        <OrderStatusProgress currentStatus={order.status} />
      </div>

      {/* Product Information */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>Thông tin sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex gap-4'>
            <img
              src={product.images?.[0]?.url || '/placeholder.png'}
              alt={product.name}
              className='w-24 h-24 object-cover rounded-lg'
            />
            <div className='flex-1'>
              <h3 className='font-semibold text-lg'>{product.name}</h3>
              <p className='text-gray-600'>Mã sản phẩm: {product.id}</p>
              <p className='text-green-600 font-bold mt-2'>${order.paymentAmount} USD</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Buyer Information */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>Thông tin người mua</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          <div>
            <span className='font-semibold'>Tên:</span> {order.buyer?.fullName || 'N/A'}
          </div>
          <div>
            <span className='font-semibold'>Email:</span> {order.buyer?.email || 'N/A'}
          </div>
          {order.shippingAddress && (
            <>
              <div>
                <span className='font-semibold'>Địa chỉ:</span> {order.shippingAddress}
              </div>
              <div>
                <span className='font-semibold'>Quận/Huyện:</span>{' '}
                {order.shippingDistrict}
              </div>
              <div>
                <span className='font-semibold'>Thành phố:</span> {order.shippingCity}
              </div>
              <div>
                <span className='font-semibold'>Số điện thoại:</span>{' '}
                {order.shippingPhone}
              </div>
              {order.shippingNote && (
                <div>
                  <span className='font-semibold'>Ghi chú:</span> {order.shippingNote}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Shipment Confirmation Form */}
      {canConfirm && !isCancelled && (
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Truck className='w-5 h-5' />
              Xác nhận giao hàng
            </CardTitle>
            <CardDescription>
              Nhập thông tin vận chuyển để xác nhận đơn hàng
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label htmlFor='carrier'>
                Đơn vị vận chuyển <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='carrier'
                placeholder='VD: Giao Hàng Nhanh, Viettel Post, J&T Express...'
                value={shippingCarrier}
                onChange={e => setShippingCarrier(e.target.value)}
                className='mt-1'
              />
            </div>
            <div>
              <Label htmlFor='tracking'>
                Mã vận đơn <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='tracking'
                placeholder='Nhập mã vận đơn'
                value={trackingNumber}
                onChange={e => setTrackingNumber(e.target.value)}
                className='mt-1'
              />
            </div>

            <div className='flex gap-3 pt-4'>
              <Button
                onClick={handleConfirmShipment}
                disabled={
                  !trackingNumber || !shippingCarrier || confirmShipmentMutation.isPending
                }
                className='flex-1'
                size='lg'>
                {confirmShipmentMutation.isPending ? (
                  <>
                    <Spinner />
                    Đang xác nhận...
                  </>
                ) : (
                  <>
                    <Package className='w-4 h-4 mr-2' />
                    Xác nhận và gửi hàng
                  </>
                )}
              </Button>

              <Button
                variant='destructive'
                onClick={() => setShowCancelDialog(true)}
                size='lg'>
                <XCircle className='w-4 h-4 mr-2' />
                Hủy đơn hàng
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Already Confirmed */}
      {order.status === OrderStatus.IN_TRANSIT && (
        <Card className='mb-6 border-green-200 bg-green-50'>
          <CardHeader>
            <CardTitle className='text-green-700'>✅ Đã xác nhận giao hàng</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div>
              <span className='font-semibold'>Đơn vị vận chuyển:</span>{' '}
              {order.shippingCarrier}
            </div>
            <div>
              <span className='font-semibold'>Mã vận đơn:</span> {order.trackingNumber}
            </div>
            <div>
              <span className='font-semibold'>Thời gian xác nhận:</span>{' '}
              {new Date(order.sellerConfirmedAt!).toLocaleString('vi-VN')}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancel Order Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hủy đơn hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='my-4'>
            <Label htmlFor='reason'>
              Lý do hủy đơn <span className='text-red-500'>*</span>
            </Label>
            <Textarea
              id='reason'
              placeholder='Nhập lý do hủy đơn hàng...'
              value={cancellationReason}
              onChange={e => setCancellationReason(e.target.value)}
              rows={4}
              className='mt-1'
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Không, quay lại</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelOrder}
              disabled={!cancellationReason.trim()}
              className='bg-red-600 hover:bg-red-700'>
              Có, hủy đơn hàng
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
