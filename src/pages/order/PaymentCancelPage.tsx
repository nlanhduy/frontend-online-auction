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
          <h1 className='mt-4 text-2xl font-bold text-red-600'>Payment Cancelled</h1>
          <p className='mt-2 text-gray-600'>
            You have cancelled the payment. Order was not created.
          </p>
          <p className='mt-2 text-sm text-gray-500'>You can try payment again anytime.</p>
          <div className='mt-6 flex flex-col gap-2'>
            <Button onClick={() => navigate(productId ? `/product/${productId}` : '/')}>
              {productId ? 'Back to Product' : 'Go to Home'}
            </Button>
            <Button variant='outline' onClick={() => navigate('/')}>
              Go to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
