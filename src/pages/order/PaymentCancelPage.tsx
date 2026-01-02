import { XCircle } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function PaymentCancelPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const productId = sessionStorage.getItem('payment_product_id')

  useEffect(() => {
    // Clean up session storage
    sessionStorage.removeItem('payment_product_id')
  }, [])

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
          <div className='mt-6 flex flex-col gap-2'>
            <Button onClick={() => navigate(productId ? `/product/${productId}` : '/')}>
              {productId ? 'Quay lại sản phẩm' : 'Về trang chủ'}
            </Button>
            <Button variant='outline' onClick={() => navigate('/')}>
              Về trang chủ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
