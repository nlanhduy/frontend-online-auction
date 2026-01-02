/* eslint-disable @typescript-eslint/no-explicit-any */
import { BrushCleaning, Calendar, Edit, PlusIcon, Star, Trash2 } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { ActionMenu } from '@/components/ui/action-menu'
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
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Spinner } from '@/components/ui/spinner'
import { QUERY_KEYS } from '@/constants/queryKey'
import { usePagination } from '@/hooks/use-pagination'
import {
  formatReadableDate,
  getPageNumbers,
  getUserRoleColor,
  handleApiError,
} from '@/lib/utils'
import { AuthAPI } from '@/services/api/auth.api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { Action } from '@/components/ui/action-menu'
import type { User } from '@/types/auth.types'

export const AdminUsers = () => {
  const { currentPage, pageSize, goToPage, nextPage, previousPage, getPaginationInfo } =
    usePagination({
      initialPage: 1,
      initialPageSize: 8,
      scrollToTop: true,
    })

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Query users
  const allUsersQuery = useQuery({
    queryKey: [QUERY_KEYS.user.all, currentPage, pageSize],
    queryFn: async () => {
      const response = await AuthAPI.getAllUsers({
        options: {
          params: {
            page: currentPage,
            limit: pageSize,
          },
        },
      })
      return response.data
    },
    staleTime: 30000, // Cache for 30 seconds
  })

  // Delete mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await AuthAPI.deleteUser({ variables: { userId } })
    },
    onSuccess: () => {
      toast.success('User deleted successfully')
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.user.all],
        exact: false,
      })
      setShowDeleteDialog(false)
      setUserToDelete(null)
    },
    onError: (error: any) => {
      handleApiError(error, 'Failed to delete user')
    },
  })

  // Memoized derived state
  const { users, serverPaginationData, totalPages } = useMemo(() => {
    const users = allUsersQuery?.data?.users || []
    const serverPaginationData = allUsersQuery.data
      ? {
          items: users,
          total: allUsersQuery.data.total,
          page: currentPage,
          limit: pageSize,
          totalPages: allUsersQuery.data.totalPages,
          hasNext: allUsersQuery.data.hasNext,
          hasPrevious: allUsersQuery.data.hasPrevious,
        }
      : null
    const paginationInfo = getPaginationInfo(serverPaginationData)

    return {
      users,
      serverPaginationData,
      paginationInfo,
      totalPages: paginationInfo.totalPages,
    }
  }, [allUsersQuery.data, currentPage, pageSize, getPaginationInfo])

  const handleConfirmDelete = useCallback(() => {
    if (userToDelete?.id) {
      deleteUserMutation.mutate(userToDelete.id)
    }
  }, [userToDelete?.id, deleteUserMutation])

  const handleDeleteUser = useCallback((user: User) => {
    setUserToDelete(user)
    setShowDeleteDialog(true)
  }, [])

  const handleEditUser = useCallback(
    (user: User) => {
      navigate(`/admin/users/${user.id}/edit`)
    },
    [navigate],
  )

  const handleViewUser = useCallback(
    (user: User) => {
      navigate(`/admin/users/${user.id}`)
    },
    [navigate],
  )

  const handleRetry = useCallback(() => {
    allUsersQuery.refetch()
  }, [allUsersQuery])

  return (
    <>
      <div className='py-12'>
        <div className='container mx-auto pt-10'>
          {allUsersQuery.isLoading ? (
            <div className='text-center py-12'>
              <Button disabled size='lg'>
                <Spinner />
                Loading users...
              </Button>
            </div>
          ) : allUsersQuery.isError ? (
            <div className='text-center py-12'>
              <p className='text-red-500 text-lg mb-4'>
                Error loading users: {allUsersQuery.error?.message || 'Unknown error'}
              </p>
              <Button onClick={handleRetry}>Retry</Button>
            </div>
          ) : users.length > 0 ? (
            <>
              <div className='flex w-full mb-8'>
                <Button
                  onClick={() => navigate('/admin/users/create')}
                  className='flex items-center ml-auto gap-2'>
                  <PlusIcon className='w-4 h-4' />
                  Create User
                </Button>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                {users.map((user: User) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onEdit={handleEditUser}
                    onDelete={handleDeleteUser}
                    onView={handleViewUser}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className='mt-12'>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={previousPage}
                          className={
                            !serverPaginationData?.hasPrevious
                              ? 'pointer-events-none opacity-50'
                              : 'cursor-pointer'
                          }
                        />
                      </PaginationItem>

                      {getPageNumbers({
                        totalPages,
                        currentPage: currentPage as number,
                      }).map((page, index) => (
                        <PaginationItem key={index}>
                          {page === 'ellipsis' ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              onClick={() => goToPage(page)}
                              isActive={currentPage === page}
                              className='cursor-pointer'>
                              {page}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext
                          onClick={nextPage}
                          className={
                            !serverPaginationData?.hasNext
                              ? 'pointer-events-none opacity-50'
                              : 'cursor-pointer'
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}

              <div className='text-center text-sm text-gray-600 mt-4'>
                Page {currentPage} of {totalPages} ({serverPaginationData?.items.length}{' '}
                of {serverPaginationData?.total} users)
              </div>
            </>
          ) : (
            <EmptyState
              icon={<BrushCleaning />}
              title='No users found'
              description='There are currently no users in the system.'
            />
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{userToDelete?.fullName}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteUserMutation.isPending}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
              {deleteUserMutation.isPending && <Spinner />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

interface UserCardProps {
  user: User
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  onView: (user: User) => void
}

const UserCard = ({ user, onEdit, onDelete, onView }: UserCardProps) => {
  const actions: Action[] = useMemo(
    () => [
      {
        label: 'Edit',
        icon: <Edit className='w-4 h-4' />,
        action: () => onEdit(user),
      },
      {
        label: 'Delete',
        icon: <Trash2 className='w-4 h-4' />,
        action: () => onDelete(user),
      },
    ],
    [user, onEdit, onDelete],
  )

  const handleCardClick = useCallback(() => {
    onView(user)
  }, [user, onView])

  const userInitial = useMemo(
    () => user.fullName?.charAt(0).toUpperCase() || 'U',
    [user.fullName],
  )

  const roleColorClass = useMemo(() => getUserRoleColor(user.role), [user.role])

  return (
    <Card
      className='relative p-6 hover:shadow-lg transition-shadow cursor-pointer'
      onClick={handleCardClick}>
      <ActionMenu actions={actions} />

      <div className='flex flex-col items-center text-center gap-4'>
        {/* Avatar */}
        <div className='w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold'>
          {user.profilePicture || user.avatar ? (
            <img
              src={user.profilePicture || user.avatar}
              alt={user.fullName}
              className='w-full h-full rounded-full object-cover'
            />
          ) : (
            <span>{userInitial}</span>
          )}
        </div>

        {/* User Info */}
        <div className='w-full'>
          <h3 className='font-semibold text-lg mb-1'>
            {user.fullName || 'Unnamed User'}
          </h3>
          <p className='text-sm text-gray-600 mb-2 break-all'>{user.email}</p>

          <Badge className={`px-2 py-1 text-xs font-medium ${roleColorClass}`}>
            {user.role}
          </Badge>
        </div>

        {/* Rating */}
        {user.rating !== undefined && (
          <div className='flex items-center gap-1 text-sm'>
            <Star className='w-4 h-4 fill-yellow-400 text-yellow-400' />
            <span className='font-medium'>{user.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Seller Expiration */}
        {user.sellerExpiration && (
          <div className='w-full pt-3 border-t'>
            <div className='flex items-center justify-center gap-2 text-xs text-gray-600'>
              <Calendar className='w-3 h-3' />
              <span>Seller Expiration: {formatReadableDate(user.sellerExpiration)}</span>
            </div>
          </div>
        )}

        {/* Created Date */}
        <div className='text-xs text-gray-500'>
          Joined {formatReadableDate(user.createdAt)}
        </div>
      </div>
    </Card>
  )
}
