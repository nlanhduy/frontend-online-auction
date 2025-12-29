import { Star } from 'lucide-react'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from 'react-router-dom'

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
import { getPageNumbers } from '@/lib/utils'
import { AuthAPI } from '@/services/api/auth.api'
import { useQuery } from '@tanstack/react-query'

import type { Action } from '@/components/ui/action-menu'
function WonAuctionsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { currentPage, pageSize, goToPage, nextPage, previousPage, getPaginationInfo } =
    usePagination({
      initialPage: 1,
      initialPageSize: 8,
      scrollToTop: true,
    })
  const productQuery = useQuery({
    queryKey: [QUERY_KEYS.user.wonAuctions(user?.id), currentPage, pageSize],
    queryFn: () =>
      AuthAPI.getBidderWonAuctions({
        options: {
          params: {
            page: currentPage,
            limit: pageSize,
          },
        },
      }),
    staleTime: 1000 * 60 * 5,
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

  const getActions = (product: any): Action[] => [
    {
      label: 'Rate & Review Product',
      action: () => {
        navigate(`/bidder/won-auctions/${product.id}/rating`)
      },
      icon: <Star />,
    },
  ]

  return (
    <>
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
              title='You haven’t won any auctions yet.'
              description='Browse all products on the marketplace.'
              button1={{
                label: 'Browse All Products',
                href: '/search',
              }}
            />
          </div>
        )}
      </div>
    </>
  )
}

export default WonAuctionsPage
