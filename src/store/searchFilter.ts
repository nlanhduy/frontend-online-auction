import { create } from 'zustand'

export type SortOption = (typeof SortOption)[keyof typeof SortOption]

export const SortOption = {
  RELEVANCE: 'relevance',
  PRICE_ASC: 'price-asc',
  PRICE_DESC: 'price-desc',
  ENDTIME_ASC: 'endtime-asc',
  NEWEST: 'newest',
} as const

// Kiểu FilterState
interface FilterState {
  searchQuery: string
  searchType: 'all' | 'name' | 'category'
  sortBy: SortOption
  selectedCategory: string | null
  setFilters: (filters: Partial<FilterState>) => void
}

export const useFilterStore = create<FilterState>(set => ({
  searchQuery: '',
  searchType: 'all',
  sortBy: SortOption.RELEVANCE,
  selectedCategory: null,
  setFilters: filters => set(state => ({ ...state, ...filters })),
}))
