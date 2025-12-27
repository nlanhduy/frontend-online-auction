/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { Filter, Loader2, Search } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { QUERY_KEYS } from '@/constants/queryKey'
import { useDebouncedSearch } from '@/hooks/use-debounced-search'
import { usePagination } from '@/hooks/use-pagination'
import { getPageNumbers } from '@/lib/utils'
import { CategoryAPI } from '@/services/api/category.api'
import { ProductAPI } from '@/services/api/product.api'
import {
  SEARCH_TYPE_OPTIONS,
  SORT_OPTION,
  SORT_OPTIONS,
  useFilterStore,
} from '@/store/searchFilter'
import { useQuery } from '@tanstack/react-query'

import type { SortOption } from '@/store/searchFilter'
export default function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const { searchQuery, searchType, sortBy, setFilters } = useFilterStore()

  const debouncedQuery = useDebouncedSearch(searchQuery, 500)

  const { currentPage, pageSize, goToPage, nextPage, previousPage, getPaginationInfo } =
    usePagination({
      initialPage: 1,
      initialPageSize: 8,
      scrollToTop: true,
    })

  // Build API params
  const apiParams = useMemo(
    () => ({
      query: debouncedQuery.trim() || undefined,
      searchType: debouncedQuery.trim() ? searchType : undefined,
      sortBy: sortBy,
      categoryId: categoryId,
      page: currentPage,
      limit: pageSize,
    }),
    [debouncedQuery, searchType, sortBy, categoryId, currentPage, pageSize],
  )

  // Fetch all products without pagination from API
  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: QUERY_KEYS.products.search(apiParams),
    queryFn: () =>
      ProductAPI.searchProducts({
        options: {
          params: apiParams,
        },
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!categoryId, // Only fetch if categoryId exists
  })

  const { data: categoryData } = useQuery({
    queryKey: QUERY_KEYS.categories.all,
    queryFn: () => CategoryAPI.getAllCategories({}),
    staleTime: Infinity,
    enabled: !!categoryId,
  })

  const allProducts = data?.data?.products || []

  const serverPaginationData = data?.data
    ? {
        items: allProducts,
        total: data?.data.total,
        page: currentPage,
        limit: pageSize,
        totalPages: data.data.totalPages,
        hasNext: data.data.hasNext,
        hasPrevious: data.data.hasPrevious,
      }
    : null

  const paginationInfo = getPaginationInfo(serverPaginationData)
  const { totalPages } = paginationInfo

  const handleSearch = (query: string) => {
    setFilters({ searchQuery: query })
  }

  const currentCategory = categoryData?.data.find(
    (c: { id: string | undefined }) => c.id === categoryId,
  )

  // If category not found
  if (!currentCategory) {
    return (
      <div className='container mx-auto py-12'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>Category Not Found</h1>
          <p className='text-gray-500 mb-6'>
            The category you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link to='/'>
            <Button>Go to Homepage</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className=''>
      {/* Category Header */}
      <div className='bg-gradient-to-r from-blue-50 to-indigo-50 py-8 mb-8'>
        <div className='container mx-auto'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            {currentCategory.name}
          </h1>
          <p className='text-gray-600'>
            {isLoading ? (
              <Button disabled size='lg'>
                <Spinner />
                Loading products...
              </Button>
            ) : (
              <>Explore {serverPaginationData?.total} products in this category</>
            )}
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className='container mx-auto mb-8'>
        <div className='flex flex-col gap-4'>
          {/* Main Search Bar */}
          <div className='flex gap-2'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
              <Input
                type='text'
                placeholder={`Search in ${currentCategory.name}...`}
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                className='pl-10 h-12 text-base'
              />
              {/* Loading indicator in input */}
              {isFetching && (
                <Loader2 className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin' />
              )}
            </div>
            {/* Search Type Selector */}
            <Select
              value={searchType}
              onValueChange={(value: any) => setFilters({ searchType: value })}>
              <SelectTrigger className='w-[180px] h-12!'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEARCH_TYPE_OPTIONS.map(type => (
                  <SelectItem value={type.value} key={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Sort Dropdown */}
            <Select
              value={sortBy}
              onValueChange={(value: SortOption) => setFilters({ sortBy: value })}>
              <SelectTrigger className='w-[180px] gap-2 h-12!'>
                <Filter className='w-4 h-4' />
                <SelectValue placeholder='Sort' />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filter Controls */}
          <div className='flex gap-2 flex-wrap items-center'>
            {/* Active filters display */}
            {searchQuery && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  setFilters({
                    searchQuery: '',
                    searchType: 'both',
                    sortBy: SORT_OPTION.RELEVANCE,
                    selectedCategory: categoryId,
                  })
                }}>
                Clear Search
              </Button>
            )}
            {/* Show searching status */}
            {isFetching && (
              <span className='text-sm text-gray-500 flex items-center gap-2'>
                <Loader2 className='w-4 h-4 animate-spin' />
                Searching...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className='container mx-auto'>
        {isLoading ? (
          <div className='text-center py-12'>
            <Button disabled size='lg'>
              <Spinner />
              Loading products...
            </Button>
          </div>
        ) : isError ? (
          <div className='text-center py-12'>
            <p className='text-red-500 text-lg mb-4'>
              Error loading products: {error?.message || 'Unknown error'}
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : allProducts.length > 0 ? (
          <>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative'>
              {/* Overlay when fetching */}
              {isFetching && (
                <div className='absolute inset-0 bg-white/50 z-10 flex items-center justify-center'>
                  <Loader2 className='w-8 h-8 animate-spin text-gray-400' />
                </div>
              )}
              {allProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination Controls with shadcn */}
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
          <div className='text-center py-12'>
            <p className='text-gray-500 text-lg mb-4'>
              {searchQuery
                ? `No products found for "${searchQuery}" in ${currentCategory.name}`
                : `No products available in ${currentCategory.name}`}
            </p>
            <div className='flex gap-2 justify-center'>
              {searchQuery && (
                <Button
                  variant='outline'
                  onClick={() => {
                    setFilters({
                      searchQuery: '',
                      searchType: 'both',
                      sortBy: SORT_OPTION.RELEVANCE,
                      selectedCategory: categoryId,
                    })
                  }}>
                  Clear Search
                </Button>
              )}
              <Link to='/search'>
                <Button>Browse All Products</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
