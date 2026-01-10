import { Bot, BrushCleaning, Hand } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatPrice, formatReadableDate } from '@/lib/utils'

import { EmptyState } from './empty-state'

import type { BidHistoryItem } from '@/types/bid.type'

export function BidHistoryTable({
  bidHistory,
  currentUserId,
  canSeeBidderRating = false,
}: {
  bidHistory?: BidHistoryItem[]
  currentUserId?: string
  canSeeBidderRating?: boolean
}) {
  if (!bidHistory?.length)
    return (
      <EmptyState
        icon={<BrushCleaning />}
        title='No bid history found'
        description='No bids have been placed on this item yet.'
      />
    )

  // Mask bidder name (e.g., "John Doe" -> "J***")
  const maskName = (name: string, isCurrentUser: boolean) => {
    if (isCurrentUser) return name + ' (You)'
    return name.charAt(0) + '***'
  }

  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Bidder</TableHead>
            <TableHead>Bid amount</TableHead>
            <TableHead>Max amount</TableHead>
            <TableHead>Time</TableHead>
            <TableHead className='text-right'>Status</TableHead>
            {canSeeBidderRating && <TableHead className='text-right'>Rating</TableHead>}
          </TableRow>
        </TableHeader>

        <TableBody>
          {bidHistory.map(bid => {
            const isCurrentUser = bid.user.id === currentUserId
            return (
              <TableRow key={bid.id}>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger>
                      {bid.isProxy ? (
                        <Bot className='w-5 h-5 text-blue-600' />
                      ) : (
                        <Hand className='w-5 h-5 text-gray-600' />
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      {bid.isProxy ? 'Auto Bid' : 'Manual Bid'}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>

                <TableCell className='font-medium'>
                  {maskName(bid.user.fullName, isCurrentUser)}
                </TableCell>

                <TableCell className='font-semibold'>{formatPrice(bid.amount)}</TableCell>

                <TableCell>
                  {bid.maxAmount && isCurrentUser ? (
                    <span className='text-blue-600 font-medium'>
                      {formatPrice(bid.maxAmount)}
                    </span>
                  ) : (
                    <span className='text-gray-400'>-</span>
                  )}
                </TableCell>

                <TableCell className='text-sm text-gray-600'>
                  {formatReadableDate(bid.createdAt)}
                </TableCell>

                <TableCell className='text-right'>
                  {bid.rejected ? (
                    <span className='text-red-500 text-sm'>Rejected</span>
                  ) : (
                    <span className='text-green-600 text-sm'>Accepted</span>
                  )}
                </TableCell>
                {canSeeBidderRating && (
                  // Link to bidder rating page
                  <TableCell className='text-right'>
                    <a
                      href={`/ratings/${bid.user.id}`}
                      className='text-blue-500 hover:underline'>
                      View
                    </a>
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TooltipProvider>
  )
}
