// src/store/searchFilter.ts
import { create } from 'zustand'

// Export enum SortOption
export const SORT_OPTION = {
  RELEVANCE: '',
  NEWEST: 'newest',
  PRICE_ASC: 'priceAsc',
  PRICE_DESC: 'priceDesc',
  ENDTIME_ASC: 'endTimeAsc',
  ENDTIME_DESC: 'endTimeDesc',
  MOST_BIDS: 'mostBids',
} as const

// Export type SortOption
export type SortOption = (typeof SORT_OPTION)[keyof typeof SORT_OPTION]

// Export search type options
export const SEARCH_TYPE_OPTIONS = [
  { label: 'All', value: 'both' },
  { label: 'Product Name', value: 'name' },
  { label: 'Category', value: 'category' },
] as const

// Export sort options for UI
export const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: '🆕 Newly Posted', value: SORT_OPTION.NEWEST },
  { label: '💰 Price: Up ↑', value: SORT_OPTION.PRICE_ASC },
  { label: '💰 Price: Down ↓', value: SORT_OPTION.PRICE_DESC },
  { label: '⏰ Ending Soon', value: SORT_OPTION.ENDTIME_ASC },
  { label: '🔥 Most Bids', value: SORT_OPTION.MOST_BIDS },
]

// Page size options
export const PAGE_SIZE_OPTIONS = [
  { label: '8 per page', value: 8 },
  { label: '12 per page', value: 12 },
  { label: '16 per page', value: 16 },
  { label: '24 per page', value: 24 },
] as const

interface FilterState {
  searchQuery: string
  searchType: 'both' | 'name' | 'category'
  sortBy: SortOption
  selectedCategory: string | null
  currentPage: number
  pageSize: number
  setFilters: (
    filters: Partial<
      Omit<FilterState, 'setFilters' | 'setCurrentPage' | 'setPageSize' | 'resetFilters'>
    >,
  ) => void
  resetFilters: () => void
}

const initialState = {
  searchQuery: '',
  searchType: 'both' as const,
  sortBy: SORT_OPTION.NEWEST,
  selectedCategory: null,
  currentPage: 1,
  pageSize: 12,
}

export const useFilterStore = create<FilterState>(set => ({
  ...initialState,
  setFilters: filters => set(state => ({ ...state, ...filters })),
  resetFilters: () => set(initialState),
}))
