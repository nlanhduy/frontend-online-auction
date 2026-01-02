/* eslint-disable @typescript-eslint/no-explicit-any */
import { CheckCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/hooks/use-auth'
import { handleApiError } from '@/lib/utils'
import { OrderAPI } from '@/services/api/order.api'

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(true)
  const [productId, setProductId] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    // Check if user is still authenticated
    if (!isAuthenticated) {
      toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại')
      navigate('/login?redirect=/payment/success' + window.location.search)
      return
    }

    const orderId = searchParams.get('token') // PayPal order ID
    const payerId = searchParams.get('PayerID')
    const productIdParam = searchParams.get('productId') // Allow productId from URL
    const storedProductId = localStorage.getItem('pendingProductId') // Use localStorage

    const finalProductId = productIdParam || storedProductId

    if (!orderId || !payerId) {
      toast.error('Thông tin thanh toán không hợp lệ: Thiếu token hoặc PayerID')
      navigate('/')
      return
    }

    if (!finalProductId) {
      toast.error('Thông tin thanh toán không hợp lệ: Thiếu Product ID')
      navigate('/')
      return
    }

    setProductId(finalProductId)
    capturePayment(orderId, finalProductId)
  }, [searchParams, navigate, isAuthenticated])

  const capturePayment = async (orderId: string, productId: string) => {
    try {
      console.log('Capturing payment...', { orderId, productId })
      const response = await OrderAPI.capturePaymentOrder({
        variables: { orderId, productId },
      })

      console.log('Capture response:', response.data)

      if (response.data.success && response.data.order) {
        const createdOrderId = response.data.order.id
        toast.success('Thanh toán thành công!')
        // Clear pending product ID
        localStorage.removeItem('pendingProductId')
        setIsProcessing(false)

        // Redirect to order page using orderId from response
        setTimeout(() => {
          navigate(`/order/${createdOrderId}`)
        }, 1500)
      } else {
        throw new Error('Payment capture failed')
      }
    } catch (error: any) {
      console.error('Capture error:', error)
      handleApiError(error, 'Thanh toán thất bại')
      navigate('/')
    }
  }

  if (isProcessing) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='py-12 text-center'>
            <Spinner />
            <p className='mt-4 text-lg font-semibold'>Đang xử lý thanh toán...</p>
            <p className='mt-2 text-sm text-gray-600'>Vui lòng không đóng trang này</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='flex min-h-screen items-center justify-center px-4'>
      <Card className='w-full max-w-md'>
        <CardContent className='py-12 text-center'>
          <CheckCircle className='mx-auto h-16 w-16 text-green-500' />
          <h1 className='mt-4 text-2xl font-bold text-green-600'>
            Thanh toán thành công!
          </h1>
          <p className='mt-2 text-gray-600'>
            Đơn hàng của bạn đã được tạo. Vui lòng gửi địa chỉ giao hàng.
          </p>
          <Button className='mt-6' onClick={() => navigate(`/order/${productId}`)}>
            Tiếp tục hoàn tất đơn hàng
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
