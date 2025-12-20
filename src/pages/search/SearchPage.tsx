/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Filter, Search } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

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

import { ProductCard } from '../../components/ui/product-card'

import type { SortOption } from '@/store/searchFilter'
export function removeVietnameseDiacritics(str: string): string {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i')
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
  str = str.replace(/đ/g, 'd')
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '')
  str = str.replace(/\u02C6|\u0306|\u031B/g, '')
  return str.toLowerCase()
}

export function searchMatch(text: string, query: string): boolean {
  const normalizedText = removeVietnameseDiacritics(text)
  const normalizedQuery = removeVietnameseDiacritics(query)
  return normalizedText.includes(normalizedQuery)
}

export default function SearchPage() {
  const [searchParams] = useSearchParams()

  const q = searchParams.get('q')
  const { searchQuery, searchType, sortBy, selectedCategory, setFilters } =
    useFilterStore()

  useEffect(() => {
    if (q && searchQuery !== q) {
      setFilters({ searchQuery: q })
    }
  }, [q])

  const debouncedQuery = useDebouncedSearch(searchQuery, 500)

  // Fetch all products without pagination from API
  const apiParams = useMemo(
    () => ({
      query: debouncedQuery.trim() || undefined,
      searchType: debouncedQuery.trim() ? searchType : undefined,
      sortBy: sortBy,
      categoryId: selectedCategory || undefined,
    }),
    [debouncedQuery, searchType, sortBy, selectedCategory],
  )

  const { data, isLoading, isError, error } = useQuery({
    queryKey: QUERY_KEYS.products.search(apiParams),
    queryFn: () =>
      ProductAPI.searchProducts({
        options: {
          params: apiParams,
        },
      }),
    staleTime: 1000 * 60 * 5,
  })

  const allProducts = data?.data?.products || []

  const { currentPage, pageSize, goToPage, nextPage, previousPage, getPaginationInfo } =
    usePagination({
      initialPage: 1,
      initialPageSize: 5,
      scrollToTop: true,
    })

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

  const { data: categoryData } = useQuery({
    queryKey: QUERY_KEYS.categories.all,
    queryFn: () => CategoryAPI.getAllCategories({}),
    staleTime: Infinity,
  })

  const paginationInfo = getPaginationInfo(serverPaginationData)
  const { totalPages } = paginationInfo

  const handleSearch = (query: string) => {
    setFilters({ searchQuery: query })
  }

  const handleCategoryFilterChange = (categoryId: string) => {
    setFilters({
      selectedCategory: categoryId === 'all' ? null : categoryId,
    })
  }

  return (
    <div className='py-12'>
      {/* Search Header */}
      <div className=''>
        <div className='container mx-auto'>
          <div className='flex flex-col gap-4'>
            {/* Main Search Bar */}
            <div className='flex gap-2'>
              <div className='relative flex-1'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                <Input
                  type='text'
                  placeholder='Search products...'
                  value={searchQuery}
                  onChange={e => handleSearch(e.target.value)}
                  className='pl-10 h-12 text-base'
                />
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
                value={sortBy || undefined}
                onValueChange={(value: SortOption) => setFilters({ sortBy: value })}>
                <SelectTrigger className='w-[180px] h-12! gap-2'>
                  <Filter className='w-4 h-4' />
                  <SelectValue placeholder='Sort' />
                </SelectTrigger>

                <SelectContent>
                  {SORT_OPTIONS.filter(o => o.value !== '').map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select
                value={selectedCategory || 'all'}
                onValueChange={handleCategoryFilterChange}>
                <SelectTrigger className='w-[180px] h-12!'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Categories</SelectItem>
                  {categoryData?.data
                    .filter((category: any) => category.children?.length > 0)
                    .map((category: any) => (
                      <div key={category.id}>
                        <SelectItem
                          value={category.id}
                          className='font-semibold text-gray-900'>
                          {category.name}
                        </SelectItem>

                        {category.children.map((child: any) => (
                          <SelectItem
                            key={child.id}
                            value={child.id}
                            className='pl-6 text-gray-600'>
                            └ {child.name}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Controls */}
            <div className='flex gap-2 flex-wrap items-center'>
              {/* Active filters display */}
              {(searchQuery || selectedCategory) && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => {
                    setFilters({
                      searchQuery: '',
                      searchType: 'both',
                      sortBy: SORT_OPTION.RELEVANCE,
                      selectedCategory: null,
                    })
                  }}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className='container mx-auto pt-10'>
        {isLoading ? (
          <div className='text-center py-12'>
            <p className='text-gray-500 text-lg'>
              <Button disabled size='lg'>
                <Spinner />
                Loading pructs...
              </Button>
            </p>
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
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
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
            <p className='text-gray-500 text-lg mb-4'>No products found</p>
            <Link to='/search'>
              <Button>View All Products</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
