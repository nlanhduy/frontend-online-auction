/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { Heart, Loader2, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
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
import { usePagination } from '@/hooks/use-pagination'
import { useRemoveFromWatchList } from '@/hooks/use-watchlist'
import { getPageNumbers } from '@/lib/utils'
import { ProductAPI } from '@/services/api/product.api'
import { useQuery } from '@tanstack/react-query'

import type { Action } from '@/components/ui/action-menu'
export default function WatchListPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: QUERY_KEYS.watchList.all,
    queryFn: () => ProductAPI.getWatchList({}),
    staleTime: 1000 * 60 * 5,
  })

  const removeFromWatchList = useRemoveFromWatchList()
  const handleRemoveFromWatchList = (productId: string) => {
    removeFromWatchList.mutate(productId ?? '')
  }

  const allProducts = data?.data.favorites || []

  // Use client-side pagination
  const {
    items: favorites,
    currentPage,
    totalPages,
    totalItems,
    hasPrevious,
    hasNext,
    goToPage,
    nextPage,
    previousPage,
  } = usePagination(allProducts, {
    pageSize: 8,
    initialPage: 1,
  })

  return (
    <div className=''>
      {/* Header */}
      <div className='bg-linear-to-r from-pink-50 to-red-50 py-8 mb-8'>
        <div className='container mx-auto'>
          <div className='flex items-center gap-3 mb-2'>
            <Heart className='w-8 h-8 text-red-500 fill-red-500' />
            <h1 className='text-3xl font-bold text-gray-900'>My Watch List</h1>
          </div>
          <p className='text-gray-600'>
            {isLoading ? (
              <Button disabled size='lg'>
                <Spinner />
                Loading watchlist...
              </Button>
            ) : (
              <>
                You have {totalItems} product{totalItems !== 1 ? 's' : ''} in your watch
                list
              </>
            )}
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className='container mx-auto'>
        {isLoading ? (
          <div className='text-center py-12'>
            <Loader2 className='w-8 h-8 animate-spin mx-auto mb-4 text-gray-400' />
            <p className='text-gray-500 text-lg'>
              <Button disabled size='lg'>
                <Spinner />
                Loading watchlist...
              </Button>
            </p>
          </div>
        ) : isError ? (
          <div className='text-center py-12'>
            <p className='text-red-500 text-lg mb-4'>
              Error loading watch list: {error?.message || 'Unknown error'}
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : favorites.length > 0 ? (
          <>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {favorites.map((product: any) => {
                const actions: Action[] = [
                  {
                    label: 'Remove from watch list',
                    action: () => handleRemoveFromWatchList(product.id),
                    icon: <Trash2 />,
                  },
                ]

                return (
                  <ProductCard key={product.id} product={product} actions={actions} />
                )
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className='mt-12'>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={previousPage}
                        className={
                          !hasPrevious
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
                          !hasNext ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}

            {/* Page info */}
            <div className='text-center text-sm text-gray-600 mt-4'>
              Page {currentPage} of {totalPages} ({favorites.length} of {totalItems}{' '}
              products)
            </div>
          </>
        ) : (
          <div className='text-center py-12'>
            <Heart className='w-16 h-16 mx-auto mb-4 text-gray-300' />
            <p className='text-gray-500 text-lg mb-4'>Your watch list is empty</p>
            <p className='text-gray-400 mb-6'>
              Start adding products to your watch list to keep track of items you&apos;re
              interested in
            </p>
            <Link to='/search'>
              <Button>Browse Products</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
