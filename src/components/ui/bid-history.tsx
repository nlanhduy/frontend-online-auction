import { BrushCleaning } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatPrice, formatReadableDate } from '@/lib/utils'

import { EmptyState } from './empty-state'

import type { Bids } from '@/types/bid.type'
export function BidHistoryTable({ bidHistory }: { bidHistory?: Bids }) {
  if (!bidHistory?.length)
    return (
      <EmptyState
        icon={<BrushCleaning />}
        title='No bid history found'
        description='You have not made any bids yet.'
      />
    )
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Bidder</TableHead>
          <TableHead>Bid amount</TableHead>
          <TableHead>Time</TableHead>
          <TableHead className='text-right'>Status</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {bidHistory.map(bid => (
          <TableRow key={bid.id}>
            <TableCell className='font-medium'>{bid.user.fullName}</TableCell>

            <TableCell>{formatPrice(bid.amount)}</TableCell>

            <TableCell>{formatReadableDate(bid.createdAt)}</TableCell>

            <TableCell className='text-right'>
              {bid.rejected ? (
                <span className='text-red-500'>Rejected</span>
              ) : (
                <span className='text-green-600'>Accepted</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
