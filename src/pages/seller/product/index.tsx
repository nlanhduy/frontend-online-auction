import { BookIcon, PlusIcon, Trash } from 'lucide-react'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { Button } from '@/components/ui/button'
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
import { ProductCard } from '@/components/ui/product-card'
import { Spinner } from '@/components/ui/spinner'
import { QUERY_KEYS } from '@/constants/queryKey'
import { useAuth } from '@/hooks/use-auth'
import { usePagination } from '@/hooks/use-pagination'
import { getPageNumbers, handleApiError } from '@/lib/utils'
import { AuthAPI } from '@/services/api/auth.api'
import { ProductAPI } from '@/services/api/product.api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { Action } from '@/components/ui/action-menu'
function SellerProducts() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<{
    id: string
    name: string
  } | null>(null)

  const { user } = useAuth()
  const navigate = useNavigate()
  const { currentPage, pageSize, goToPage, nextPage, previousPage, getPaginationInfo } =
    usePagination({
      initialPage: 1,
      initialPageSize: 8,
      scrollToTop: true,
    })
  const queryClient = useQueryClient()
  const productQuery = useQuery({
    queryKey: [QUERY_KEYS.user.myProducts(user?.id), currentPage, pageSize],
    queryFn: () =>
      AuthAPI.getMyProducts({
        options: {
          params: {
            page: currentPage,
            limit: pageSize,
          },
        },
      }),
    staleTime: 1000 * 60 * 5,
  })

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) =>
      ProductAPI.deleteProduct({ variables: { productId: id } }),
    onSuccess: () => {
      toast.success('Product deleted successfully')
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.user.myProducts(user?.id)],
        exact: false,
      })
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    },
    onError: err => {
      handleApiError(err)
      setDeleteDialogOpen(false)
    },
  })

  const allProducts = productQuery?.data?.data.items || []
  const serverPaginationData = productQuery.data
    ? {
        items: allProducts,
        total: productQuery?.data.data.total,
        page: currentPage,
        limit: pageSize,
        totalPages: productQuery?.data.data.totalPages,
        hasNext: productQuery?.data.data.hasNext,
        hasPrevious: productQuery.data.data.hasPrevious,
      }
    : null
  const paginationInfo = getPaginationInfo(serverPaginationData)
  const { totalPages } = paginationInfo

  const handleDeleteClick = (product: any) => {
    setProductToDelete({ id: product.id, name: product.name || 'this product' })
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete.id)
    }
  }

  const getActions = (product: any): Action[] => [
    {
      label: 'Delete',
      action: () => handleDeleteClick(product),
      icon: <Trash />,
    },
    {
      label: 'Add description',
      action: () => {
        navigate(`/seller/products/${product.id}/edit`)
      },
      icon: <BookIcon />,
    },
  ]

  return (
    <>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{' '}
              <span className='font-semibold'>{productToDelete?.name}</span> and remove it
              from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteProductMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteProductMutation.isPending}
              className='bg-red-600 hover:bg-red-700'>
              {deleteProductMutation.isPending ? (
                <>
                  <Spinner />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Products Grid */}
      <div className='container mx-auto py-12'>
        {productQuery.isPending ? (
          <div className='text-center py-12'>
            <Button disabled size='lg'>
              <Spinner />
              Loading products...
            </Button>
          </div>
        ) : productQuery.isError ? (
          <div className='text-center py-12'>
            <p className='text-red-500 text-lg mb-4'>
              Error loading products: {productQuery.error?.message || 'Unknown error'}
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : allProducts.length > 0 ? (
          <>
            <div className='flex w-full mb-8'>
              {/* Create product button */}
              <Button
                onClick={() => navigate('/seller/products/new')}
                className='flex items-center ml-auto gap-2'>
                <PlusIcon className='w-4 h-4' />
                Create Product
              </Button>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative'>
              {/* Overlay when fetching */}
              {productQuery.isFetching && (
                <div className='absolute inset-0 bg-white/50 z-10 flex items-center justify-center'>
                  <Spinner />
                </div>
              )}
              {allProducts.map((product: any) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  actions={getActions(product)}
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

            {/* Page info */}
            <div className='text-center text-sm text-gray-600 mt-4'>
              Page {currentPage} of {totalPages} ({allProducts.length} of{' '}
              {serverPaginationData?.total} products)
            </div>
          </>
        ) : (
          <div className='h-full py-12'>
            <EmptyState
              title='You don’t have any products yet'
              description='You can create a new product by clicking the button below.'
              button1={{
                label: 'Create Product',
                href: '/seller/products/new',
              }}
            />
          </div>
        )}
      </div>
    </>
  )
}

export default SellerProducts
