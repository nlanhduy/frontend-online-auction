import { CheckCircle, XCircle } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function PaymentDemoPage() {
  const navigate = useNavigate()
  const [productId, setProductId] = useState('')
  const [selectedView, setSelectedView] = useState<'success' | 'cancel' | null>(null)

  const handleViewSuccess = () => {
    setSelectedView('success')
  }

  const handleViewCancel = () => {
    setSelectedView('cancel')
  }

  const handleContinue = () => {
    if (!productId) {
      alert('Vui lòng nhập Product ID')
      return
    }
    navigate(`/order/${productId}`)
  }

  const handleReset = () => {
    setSelectedView(null)
  }

  if (selectedView === 'success') {
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
            <div className='mt-6 space-y-3'>
              <Button onClick={handleContinue} disabled={!productId} className='w-full'>
                Tiếp tục hoàn tất đơn hàng
              </Button>
              <Button variant='outline' onClick={handleReset} className='w-full'>
                ← Quay lại demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (selectedView === 'cancel') {
    return (
      <div className='flex min-h-screen items-center justify-center px-4'>
        <Card className='w-full max-w-md'>
          <CardContent className='py-12 text-center'>
            <XCircle className='mx-auto h-16 w-16 text-red-500' />
            <h1 className='mt-4 text-2xl font-bold text-red-600'>Thanh toán đã bị hủy</h1>
            <p className='mt-2 text-gray-600'>
              Bạn đã hủy thanh toán. Đơn hàng chưa được tạo.
            </p>
            <p className='mt-2 text-sm text-gray-500'>
              Bạn có thể thử thanh toán lại bất kỳ lúc nào.
            </p>
            <div className='mt-6 space-y-3'>
              <Button
                onClick={() => navigate(productId ? `/product/${productId}` : '/')}
                disabled={!productId}
                className='w-full'>
                {productId ? 'Quay lại sản phẩm' : 'Về trang chủ'}
              </Button>
              <Button variant='outline' onClick={handleReset} className='w-full'>
                ← Quay lại demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <Card className='mx-auto max-w-2xl'>
        <CardHeader>
          <CardTitle>🎨 Payment UI Demo (Chỉ xem UI)</CardTitle>
          <p className='text-sm text-gray-600'>
            Xem UI của các trang payment mà không cần backend hoặc PayPal
          </p>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Product ID Input */}
          <div className='space-y-2'>
            <Label htmlFor='productId'>Product ID (optional)</Label>
            <Input
              id='productId'
              placeholder='Nhập Product ID để test navigation'
              value={productId}
              onChange={e => setProductId(e.target.value)}
            />
            <p className='text-xs text-gray-500'>
              💡 Nếu có productId, button sẽ navigate sang /order/{'{'}productId{'}'}
            </p>
          </div>

          {/* Demo Options */}
          <div className='space-y-4'>
            <h3 className='font-semibold'>Chọn view muốn xem:</h3>

            {/* Success View */}
            <Card className='border-green-200 bg-green-50'>
              <CardContent className='pt-6'>
                <h4 className='mb-2 font-semibold text-green-900'>
                  ✅ Payment Success Page
                </h4>
                <p className='mb-4 text-sm text-green-700'>
                  Xem UI khi thanh toán thành công (không call backend)
                </p>
                <Button
                  onClick={handleViewSuccess}
                  className='w-full bg-green-600 hover:bg-green-700'>
                  Xem Success Page
                </Button>
              </CardContent>
            </Card>

            {/* Cancel View */}
            <Card className='border-red-200 bg-red-50'>
              <CardContent className='pt-6'>
                <h4 className='mb-2 font-semibold text-red-900'>
                  ❌ Payment Cancel Page
                </h4>
                <p className='mb-4 text-sm text-red-700'>
                  Xem UI khi user hủy thanh toán (không call backend)
                </p>
                <Button
                  onClick={handleViewCancel}
                  variant='destructive'
                  className='w-full'>
                  Xem Cancel Page
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Info */}
          <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
            <h4 className='mb-2 font-semibold text-blue-900'>ℹ️ Lưu ý:</h4>
            <ul className='list-inside list-disc space-y-1 text-sm text-blue-800'>
              <li>Trang này CHỈ để xem UI, không call backend hay PayPal</li>
              <li>Để test với backend thật, dùng /test/payment</li>
              <li>
                Để test full flow, cần product COMPLETED và order data trong backend
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className='space-y-2'>
            <h4 className='font-semibold'>Quick Links:</h4>
            <div className='flex flex-wrap gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => navigate('/test/payment')}>
                🧪 Test với Backend
              </Button>
              <Button variant='outline' size='sm' onClick={() => navigate('/')}>
                🏠 Homepage
              </Button>
              <Button variant='outline' size='sm' onClick={() => navigate('/search')}>
                🔍 Search Products
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
