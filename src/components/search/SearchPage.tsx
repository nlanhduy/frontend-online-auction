/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Filter, Search } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'

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
import { CATEGORIES, getProductsWithNewBadge, MOCK_PRODUCTS } from '@/data/mock-data'
import { usePagination } from '@/hooks/use-pagination'
import { SortOption, useFilterStore } from '@/store/searchFilter'

import { ProductCard } from '../ui/product-card'

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

export default function SearchPage() {
  const { searchQuery, searchType, sortBy, selectedCategory, setFilters } =
    useFilterStore()

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let products = MOCK_PRODUCTS

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.trim()
      products = products.filter(product => {
        if (searchType === 'name' || searchType === 'all') {
          if (searchMatch(product.name, query)) return true
          if (searchMatch(product.description, query)) return true
        }
        if (searchType === 'category' || searchType === 'all') {
          if (searchMatch(product.categoryName, query)) return true
        }
        return false
      })
    }

    // Apply category filter
    if (selectedCategory) {
      products = products.filter(p => p.categoryId === selectedCategory)
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
  }, [searchQuery, searchType, sortBy, selectedCategory])

  // Pagination
  const pagination = usePagination(filteredProducts, { pageSize: 3 })

  const handleSearch = (query: string) => {
    setFilters({ searchQuery: query })
    pagination.goToPage(1)
  }

  const handleCategoryClick = (categoryId: string) => {
    setFilters({
      selectedCategory: selectedCategory === categoryId ? null : categoryId,
    })
    pagination.goToPage(1)
  }

  const handleCategoryFilterChange = (categoryId: string) => {
    setFilters({
      selectedCategory: categoryId === 'all' ? null : categoryId,
    })
    pagination.goToPage(1)
  }

  //   const activeCategoryName = CATEGORIES.find(c => c.id === selectedCategory)?.name

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
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Search Header */}
      <div className='bg-white border-b sticky top-0 z-40'>
        <div className='container mx-auto px-4 py-6'>
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
                  className='pl-10 text-base'
                />
              </div>

              {/* Search Type Selector */}
              <Select
                value={searchType}
                onValueChange={(value: any) => setFilters({ searchType: value })}>
                <SelectTrigger className='w-[180px]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All</SelectItem>
                  <SelectItem value='name'>Product Name</SelectItem>
                  <SelectItem value='category'>Category</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort Dropdown */}
              <Select
                value={sortBy}
                onValueChange={(value: SortOption) => setFilters({ sortBy: value })}>
                <SelectTrigger className='w-[180px] gap-2'>
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

              {/* Category Filter */}
              <Select
                value={selectedCategory || 'all'}
                onValueChange={handleCategoryFilterChange}>
                <SelectTrigger className='w-[180px]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Categories</SelectItem>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
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
                      searchType: 'all',
                      sortBy: SortOption.RELEVANCE,
                      selectedCategory: null,
                    })
                    pagination.goToPage(1)
                  }}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className='container mx-auto px-4 py-8'>
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
                  isNew={product.isNew}
                  onCategoryClick={() => handleCategoryClick(product.categoryId)}
                />
              ))}
            </div>

            {/* Pagination Controls with shadcn */}
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
