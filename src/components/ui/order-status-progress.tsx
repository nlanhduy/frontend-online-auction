import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'
import { OrderStatus } from '@/types/order.type'

interface OrderStatusProgressProps {
  currentStatus: OrderStatus
}

const STATUS_STEPS = [
  { status: OrderStatus.PAYMENT_PENDING, step: 1, label: 'Payment' },
  { status: OrderStatus.SHIPPING_INFO_PENDING, step: 2, label: 'Shipping Address' },
  {
    status: OrderStatus.SELLER_CONFIRMATION_PENDING,
    step: 3,
    label: 'Seller Confirmation',
  },
  { status: OrderStatus.IN_TRANSIT, step: 4, label: 'In Transit' },
  { status: OrderStatus.COMPLETED, step: 5, label: 'Completed' },
]

const getStepNumber = (status: OrderStatus): number => {
  if (status === OrderStatus.CANCELLED) return 0
  if (status === OrderStatus.BUYER_CONFIRMATION_PENDING) return 4
  const step = STATUS_STEPS.find(s => s.status === status)
  return step?.step || 0
}

export function OrderStatusProgress({ currentStatus }: OrderStatusProgressProps) {
  const currentStep = getStepNumber(currentStatus)

  if (currentStatus === OrderStatus.CANCELLED) {
    return (
      <div className='rounded-lg border border-red-200 bg-red-50 p-6 text-center'>
        <p className='text-lg font-semibold text-red-600'>❌ Order has been cancelled</p>
      </div>
    )
  }

  return (
    <div className='w-full py-6'>
      <div className='relative flex items-center justify-between'>
        {/* Progress Line */}
        <div className='absolute left-0 right-0 top-5 h-1 bg-gray-200'>
          <div
            className='h-full bg-green-500 transition-all duration-500'
            style={{ width: `${((currentStep - 1) / (STATUS_STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        {STATUS_STEPS.map(({ step, label, status }) => {
          const isCompleted = step < currentStep
          const isCurrent = step === currentStep

          return (
            <div key={status} className='relative z-10 flex flex-col items-center'>
              {/* Step Circle */}
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300',
                  {
                    'border-green-500 bg-green-500 text-white': isCompleted,
                    'border-blue-500 bg-blue-500 text-white': isCurrent,
                    'border-gray-300 bg-white text-gray-400': !isCompleted && !isCurrent,
                  },
                )}>
                {isCompleted ? (
                  <Check className='h-5 w-5' />
                ) : (
                  <span className='text-sm font-semibold'>{step}</span>
                )}
              </div>

              {/* Step Label */}
              <div className='mt-2 w-24 text-center h-8'>
                <p
                  className={cn('text-xs font-medium', {
                    'text-green-600': isCompleted,
                    'text-blue-600': isCurrent,
                    'text-gray-400': !isCompleted && !isCurrent,
                  })}>
                  {label}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
