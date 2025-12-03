'use client'

import { Filter, Search } from 'lucide-react'
import React, { useMemo } from 'react'
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
import { CATEGORIES, getProductsWithNewBadge, MOCK_PRODUCTS } from '@/data/mock-data'
import { usePagination } from '@/hooks/use-pagination'
import { SortOption } from '@/store/searchFilter'

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

export const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Most Relevant', value: SortOption.RELEVANCE },
  { label: '🆕 Newly Posted', value: SortOption.NEWEST },
  { label: '💰 Price: Up ↑', value: SortOption.PRICE_ASC },
  { label: '💰 Price: Down ↓', value: SortOption.PRICE_DESC },
  { label: '⏰ Ending Soon', value: SortOption.ENDTIME_ASC },
]

export default function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>()

  // Local state for category page filters
  const [searchQuery, setSearchQuery] = React.useState('')
  const [sortBy, setSortBy] = React.useState<SortOption>(SortOption.RELEVANCE)

  // Get current category info
  const currentCategory = CATEGORIES.find(c => c.id === categoryId)
  console.log({ categoryId })

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let products = MOCK_PRODUCTS

    // Filter by category
    if (categoryId) {
      products = products.filter(p => p.categoryId === categoryId)
    }

    // Apply search filter (search within category)
    if (searchQuery.trim()) {
      const query = searchQuery.trim()
      products = products.filter(product => {
        if (searchMatch(product.name, query)) return true
        if (searchMatch(product.description, query)) return true
        return false
      })
    }

    // Apply sorting
    const sortedProducts = [...products].sort((a, b) => {
      switch (sortBy) {
        case SortOption.PRICE_ASC:
          return a.currentPrice - b.currentPrice
        case SortOption.PRICE_DESC:
          return b.currentPrice - a.currentPrice
        case SortOption.ENDTIME_ASC:
          return a.endTime.getTime() - b.endTime.getTime()
        case SortOption.NEWEST:
          return b.createdAt.getTime() - a.createdAt.getTime()
        default:
          return 0
      }
    })

    return getProductsWithNewBadge(sortedProducts)
  }, [categoryId, searchQuery, sortBy])

  // Pagination
  const pagination = usePagination(filteredProducts, { pageSize: 12 })

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    pagination.goToPage(1)
  }

  const handleSortChange = (value: SortOption) => {
    setSortBy(value)
    pagination.goToPage(1)
  }

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const totalPages = pagination.totalPages
    const currentPage = pagination.currentPage

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('ellipsis')
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (currentPage < totalPages - 2) pages.push('ellipsis')
      pages.push(totalPages)
    }

    return pages
  }

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
      <div className='bg-linear-to-r from-blue-50 to-indigo-50 py-8 mb-8'>
        <div className='container mx-auto'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            {currentCategory.name}
          </h1>
          <p className='text-gray-600'>
            Explore {filteredProducts.length} products in this category
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className='container mx-auto mb-8'>
        <div className='flex flex-col gap-4'>
          {/* Search Bar and Sort */}
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
            </div>

            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className='w-[200px] gap-2 h-12!'>
                <Filter className='w-4 h-4' />
                <SelectValue placeholder='Sort By' />
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

          {/* Active filters display */}
          {searchQuery && (
            <div className='flex gap-2 items-center'>
              <span className='text-sm text-gray-600'>
                Searching for: <strong>&quot;{searchQuery}&quot;</strong>
              </span>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  setSearchQuery('')
                  pagination.goToPage(1)
                }}>
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className='container mx-auto'>
        {pagination.items.length > 0 ? (
          <>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {pagination.items.map(product => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  image={product.images[0]}
                  currentPrice={product.currentPrice}
                  categoryName={product.categoryName}
                  categoryId={product.categoryId}
                  endTime={product.endTime}
                  bidCount={product.bidCount}
                  highestBidder={product.highestBidder}
                  buyNowPrice={product.buyNowPrice}
                  createdAt={product.createdAt}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className='mt-12'>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={pagination.previousPage}
                        className={
                          !pagination.hasPrevious
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>

                    {getPageNumbers().map((page, index) => (
                      <PaginationItem key={index}>
                        {page === 'ellipsis' ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            onClick={() => pagination.goToPage(page)}
                            isActive={pagination.currentPage === page}
                            className='cursor-pointer'>
                            {page}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={pagination.nextPage}
                        className={
                          !pagination.hasNext
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
              Page {pagination.currentPage} of {pagination.totalPages} (
              {pagination.items.length} products)
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
                <Button variant='outline' onClick={() => setSearchQuery('')}>
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
