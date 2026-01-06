import { Trophy, TrendingDown } from 'lucide-react'
import { Badge } from './badge'

interface BidStatusBadgeProps {
  isWinning: boolean
  remainingBudget?: number
}

export function BidStatusBadge({ isWinning, remainingBudget }: BidStatusBadgeProps) {
  if (isWinning) {
    return (
      <div className='flex flex-col gap-2'>
        <Badge className='bg-green-100 text-green-700 border-green-300 flex items-center gap-2 w-fit'>
          <Trophy className='w-4 h-4' />
          Winning
        </Badge>
        {remainingBudget !== undefined && remainingBudget > 0 && (
          <p className='text-sm text-gray-600'>
            Auto-bid budget remaining:{' '}
            <span className='font-semibold'>${remainingBudget.toLocaleString()}</span>
          </p>
        )}
      </div>
    )
  }

  return (
    <Badge className='bg-red-100 text-red-700 border-red-300 flex items-center gap-2 w-fit'>
      <TrendingDown className='w-4 h-4' />
      Outbid
    </Badge>
  )
}
