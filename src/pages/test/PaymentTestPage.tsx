import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function PaymentTestPage() {
  const navigate = useNavigate()
  const [productId, setProductId] = useState('')

  const handleTestPayment = () => {
    if (!productId) {
      alert('Vui lòng nhập Product ID')
      return
    }
    // Bypass to order page directly
    navigate(`/order/${productId}`)
  }

  const handleTestPaymentSuccess = () => {
    if (!productId) {
      alert('Vui lòng nhập Product ID')
      return
    }
    // Mock payment success callback with productId in URL
    navigate(
      `/payment/success?token=TEST_ORDER_123&PayerID=TEST_PAYER&productId=${productId}`,
    )
  }

  const handleTestPaymentCancel = () => {
    // Store productId for cancel page to use
    if (productId) {
      sessionStorage.setItem('payment_product_id', productId)
    }
    navigate('/payment/cancel?token=TEST_ORDER_123')
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <Card className='mx-auto max-w-2xl'>
        <CardHeader>
          <CardTitle>🧪 Payment Flow Testing</CardTitle>
          <p className='text-sm text-gray-600'>
            Test page để bypass vào các bước payment flow mà không cần đợi auction kết
            thúc
          </p>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Product ID Input */}
          <div className='space-y-2'>
            <Label htmlFor='productId'>Product ID</Label>
            <Input
              id='productId'
              placeholder='Nhập Product ID (cần là product COMPLETED)'
              value={productId}
              onChange={e => setProductId(e.target.value)}
            />
            <p className='text-xs text-gray-500'>
              💡 Lấy từ URL product detail: /product/<strong>{'{productId}'}</strong>
            </p>
          </div>

          {/* Test Scenarios */}
          <div className='space-y-4'>
            <h3 className='font-semibold'>Test Scenarios:</h3>

            {/* Scenario 1: Direct to Order Page */}
            <Card className='border-blue-200 bg-blue-50'>
              <CardContent className='pt-6'>
                <h4 className='mb-2 font-semibold text-blue-900'>
                  1️⃣ Test Order Fulfillment Page
                </h4>
                <p className='mb-4 text-sm text-blue-700'>
                  Bypass trực tiếp vào trang hoàn tất đơn hàng (cần backend có order data)
                </p>
                <Button onClick={handleTestPayment} className='w-full'>
                  → Vào Order Page
                </Button>
              </CardContent>
            </Card>

            {/* Scenario 2: Payment Success */}
            <Card className='border-green-200 bg-green-50'>
              <CardContent className='pt-6'>
                <h4 className='mb-2 font-semibold text-green-900'>
                  2️⃣ Test Payment Success Page
                </h4>
                <p className='mb-4 text-sm text-green-700'>
                  Giả lập callback từ PayPal sau khi thanh toán thành công. Product ID sẽ
                  được truyền qua URL.
                </p>
                <div className='mb-4 rounded border border-red-300 bg-red-100 p-3'>
                  <p className='text-xs font-semibold text-red-800'>
                    ⚠️ CHÚ Ý: Scenario này sẽ FAIL!
                  </p>
                  <p className='mt-1 text-xs text-red-700'>
                    • OrderId "TEST_ORDER_123" không tồn tại trong PayPal
                  </p>
                  <p className='text-xs text-red-700'>
                    • Backend sẽ báo lỗi: RESOURCE_NOT_FOUND
                  </p>
                  <p className='mt-2 text-xs font-semibold text-red-800'>
                    → Dùng /demo/payment để xem UI, hoặc tạo real PayPal order
                  </p>
                </div>
                <Button
                  onClick={handleTestPaymentSuccess}
                  className='w-full bg-green-600 hover:bg-green-700'
                  disabled={!productId}>
                  → Test Payment Success (Sẽ lỗi)
                </Button>
                <p className='mt-2 text-xs text-green-600'>
                  ℹ️ Sẽ call backend: POST /payment/capture-order/TEST_ORDER_123/{'{'}
                  productId{'}'}
                </p>
              </CardContent>
            </Card>

            {/* Scenario 3: Payment Cancel */}
            <Card className='border-red-200 bg-red-50'>
              <CardContent className='pt-6'>
                <h4 className='mb-2 font-semibold text-red-900'>
                  3️⃣ Test Payment Cancel Page
                </h4>
                <p className='mb-4 text-sm text-red-700'>
                  Giả lập khi user hủy thanh toán trên PayPal
                </p>
                <Button
                  onClick={handleTestPaymentCancel}
                  variant='destructive'
                  className='w-full'>
                  → Test Payment Cancel
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-4'>
            <h4 className='mb-2 font-semibold text-yellow-900'>⚠️ Lưu ý quan trọng:</h4>
            <ol className='list-inside list-decimal space-y-1 text-sm text-yellow-800'>
              <li>
                <strong>Scenario 2 & 3 cần backend thật</strong> - Sẽ call API backend
              </li>
              <li>
                Backend cần có product COMPLETED và order data hợp lệ trong database
              </li>
              <li>
                Nếu chỉ muốn <strong>xem UI</strong>, dùng{' '}
                <a href='/demo/payment' className='font-semibold underline'>
                  /demo/payment
                </a>{' '}
                (không call backend)
              </li>
              <li>
                <strong className='text-red-700'>
                  Test orderId "TEST_ORDER_123" sẽ fail ở PayPal!
                </strong>{' '}
                PayPal báo RESOURCE_NOT_FOUND
              </li>
              <li>
                Để test full flow: Cần login as winner/seller và product phải có order
                data trong backend
              </li>
            </ol>
          </div>

          {/* Real Test Guide */}
          <div className='rounded-lg border border-purple-200 bg-purple-50 p-4'>
            <h4 className='mb-2 font-semibold text-purple-900'>
              🔧 Cách test thật với PayPal:
            </h4>
            <ol className='list-inside list-decimal space-y-2 text-sm text-purple-800'>
              <li>
                <strong>Tạo order:</strong> POST /payment/create-order với productId thật
                <pre className='mt-1 overflow-x-auto rounded bg-purple-100 p-2 text-xs'>
                  {`curl -X POST http://localhost:3000/payment/create-order \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{"productId": "prod-123"}'`}
                </pre>
              </li>
              <li>
                <strong>Approve:</strong> Mở approvalUrl trong browser, login PayPal
                sandbox và approve
              </li>
              <li>
                <strong>Capture:</strong> PayPal sẽ redirect về /payment/success với
                orderId thật
              </li>
              <li className='text-xs text-purple-600'>
                💡 PayPal order chỉ tồn tại 3 giờ, phải approve & capture ngay
              </li>
            </ol>
          </div>

          {/* Quick Links */}
          <div className='space-y-2'>
            <h4 className='font-semibold'>Quick Links:</h4>
            <div className='flex flex-wrap gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => navigate('/demo/payment')}>
                🎨 Demo UI Only
              </Button>
              <Button variant='outline' size='sm' onClick={() => navigate('/')}>
                🏠 Homepage
              </Button>
              <Button variant='outline' size='sm' onClick={() => navigate('/search')}>
                🔍 Search Products
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => navigate('/seller/products')}>
                📦 My Products (Seller)
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => navigate('/bidder/active-bids')}>
                🎯 Active Bids (Bidder)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
