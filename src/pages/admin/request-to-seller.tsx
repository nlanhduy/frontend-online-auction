/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Mail,
  MoreVertical,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { QUERY_KEYS } from '@/constants/queryKey'
import { useAuth } from '@/hooks/use-auth'
import { handleApiError } from '@/lib/utils'
import { AuthAPI } from '@/services/api/auth.api'
import { UserRole } from '@/types/auth.types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

function AdminRequestToSeller() {
  const { user, isAuthenticated } = useAuth()
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean
    type: 'approve' | 'reject' | null
    requestId: string | null
    userName: string | null
  }>({
    isOpen: false,
    type: null,
    requestId: null,
    userName: null,
  })

  const requestToSellerQuery = useQuery({
    queryKey: QUERY_KEYS.requestToSellers.all,
    queryFn: () => AuthAPI.getAllPendingSellers({}),
    staleTime: 5 * 60 * 1000,
    enabled: !!isAuthenticated && !!user && user.role === UserRole.Admin,
  })

  const requestToSeller = requestToSellerQuery.data?.data

  const queryClient = useQueryClient()
  const approveSellerMutation = useMutation({
    mutationFn: (id: string) => AuthAPI.approveSeller({ variables: { requestId: id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.requestToSellers.all })
      toast.success('Approve seller successfully!')
      setDialogState({ isOpen: false, type: null, requestId: null, userName: null })
    },
    onError: error => {
      handleApiError(error)
    },
  })

  const rejectSellerMutation = useMutation({
    mutationFn: (id: string) => AuthAPI.rejectSeller({ variables: { requestId: id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.requestToSellers.all })
      toast.success('Reject seller successfully!')
      setDialogState({ isOpen: false, type: null, requestId: null, userName: null })
    },
    onError: error => {
      handleApiError(error)
    },
  })

  const getDaysAgo = (date: string) => {
    const now = new Date()
    const requestDate = new Date(date)
    const diffTime = Math.abs(now.getTime() - requestDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleApprove = (requestId: string, userName: string) => {
    setDialogState({
      isOpen: true,
      type: 'approve',
      requestId,
      userName,
    })
  }

  const handleReject = (requestId: string, userName: string) => {
    setDialogState({
      isOpen: true,
      type: 'reject',
      requestId,
      userName,
    })
  }

  const confirmAction = () => {
    if (!dialogState.requestId) return

    if (dialogState.type === 'approve') {
      approveSellerMutation.mutate(dialogState.requestId)
    } else if (dialogState.type === 'reject') {
      rejectSellerMutation.mutate(dialogState.requestId)
    }
  }

  const closeDialog = () => {
    setDialogState({ isOpen: false, type: null, requestId: null, userName: null })
  }

  if (requestToSellerQuery.isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-lg'>Loading...</div>
      </div>
    )
  }

  if (requestToSellerQuery.isError) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-lg text-red-500'>Error loading seller requests</div>
      </div>
    )
  }

  return (
    <div className='container mx-auto py-8 px-4'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Seller Requests</h1>
        <p className='text-muted-foreground'>
          Review and manage bidder requests to become sellers
        </p>
      </div>

      {!requestToSeller || requestToSeller.length === 0 ? (
        <Card>
          <CardContent className='flex items-center justify-center py-12'>
            <p className='text-muted-foreground'>No pending seller requests</p>
          </CardContent>
        </Card>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {requestToSeller.map((request: any) => {
            const daysAgo = getDaysAgo(request.createdAt)
            const isWithin7Days = daysAgo <= 7

            return (
              <Card key={request.id} className='relative'>
                <CardHeader className='pb-4'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <CardTitle className='text-xl mb-1'>
                        {request.user.fullName}
                      </CardTitle>
                      <CardDescription className='flex items-center gap-1'>
                        <Mail className='h-3 w-3' />
                        {request.user.email}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          disabled={
                            approveSellerMutation.isPending ||
                            rejectSellerMutation.isPending
                          }>
                          <MoreVertical className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end' className='w-48'>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleApprove(request.id, request.user.fullName)}
                          className='cursor-pointer'>
                          <ThumbsUp className='mr-2 h-4 w-4' />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleReject(request.id, request.user.fullName)}
                          className='cursor-pointer text-red-600'>
                          <ThumbsDown className='mr-2 h-4 w-4' />
                          Reject
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-muted-foreground'>User ID</span>
                      <span className='font-mono text-xs'>
                        {request.userId.slice(0, 8)}...
                      </span>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-muted-foreground'>Request ID</span>
                      <span className='font-mono text-xs'>
                        {request.id.slice(0, 8)}...
                      </span>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-muted-foreground'>Status</span>
                      <Badge variant='outline'>{request.status}</Badge>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-muted-foreground flex items-center gap-1'>
                        <Calendar className='h-3 w-3' />
                        Requested
                      </span>
                      <span
                        className={
                          isWithin7Days
                            ? 'text-green-600 font-medium'
                            : 'text-muted-foreground'
                        }>
                        {daysAgo} {daysAgo === 1 ? 'day' : 'days'} ago
                      </span>
                    </div>
                  </div>

                  <div className='pt-2 border-t'>
                    <div className='text-sm font-medium mb-2'>Ratings</div>
                    <div className='flex items-center justify-around'>
                      <div className='flex flex-col items-center'>
                        <div className='flex items-center gap-1 text-green-600'>
                          <ThumbsUp className='h-4 w-4' />
                          <span className='font-semibold'>
                            {request.user.positiveRating}
                          </span>
                        </div>
                        <span className='text-xs text-muted-foreground'>Positive</span>
                      </div>
                      <div className='h-8 w-px bg-border' />
                      <div className='flex flex-col items-center'>
                        <div className='flex items-center gap-1 text-red-600'>
                          <ThumbsDown className='h-4 w-4' />
                          <span className='font-semibold'>
                            {request.user.negativeRating}
                          </span>
                        </div>
                        <span className='text-xs text-muted-foreground'>Negative</span>
                      </div>
                    </div>
                  </div>

                  <div className='text-xs text-muted-foreground pt-2 border-t'>
                    Created: {new Date(request.createdAt).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog
        open={dialogState.isOpen}
        onOpenChange={() => {
          // Only allow closing if not processing
          if (!approveSellerMutation.isPending && !rejectSellerMutation.isPending) {
            closeDialog()
          }
        }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2'>
              {dialogState.type === 'approve' ? (
                <>
                  <CheckCircle className='h-5 w-5 text-green-600' />
                  Approve Seller Request
                </>
              ) : (
                <>
                  <AlertTriangle className='h-5 w-5 text-red-600' />
                  Reject Seller Request
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className='space-y-2'>
              {dialogState.type === 'approve' ? (
                <>
                  <p>
                    Are you sure you want to approve{' '}
                    <strong>{dialogState.userName}</strong>&apos;s request to become a
                    seller?
                  </p>
                  <p className='text-sm'>
                    This will grant them seller privileges and they will be able to create
                    auctions.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Are you sure you want to reject{' '}
                    <strong>{dialogState.userName}</strong>&apos;s request to become a
                    seller?
                  </p>
                  <p className='text-sm'>
                    They will need to submit a new request if they want to become a seller
                    in the future.
                  </p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={
                approveSellerMutation.isPending || rejectSellerMutation.isPending
              }>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              disabled={approveSellerMutation.isPending || rejectSellerMutation.isPending}
              className={
                dialogState.type === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''
              }>
              {approveSellerMutation.isPending || rejectSellerMutation.isPending
                ? 'Processing...'
                : dialogState.type === 'approve'
                  ? 'Approve'
                  : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default AdminRequestToSeller
