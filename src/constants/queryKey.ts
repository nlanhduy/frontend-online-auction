import type { SearchProductsParams } from '@/types/product.type'

export const QUERY_KEYS = {
  // Auth related
  auth: {
    login: ['auth', 'login'] as const,
    register: ['auth', 'register'] as const,
    verifyOTP: ['auth', 'verify-otp'] as const,
    resendOTP: ['auth', 'resend-otp'] as const,
    refresh: ['auth', 'refresh'] as const,
    logout: ['auth', 'logout'] as const,
    me: ['auth', 'me'] as const,
  },

  user: {
    profile: (userId: string) => ['user', 'profile', userId] as const,
    all: ['user', 'all'] as const,
  },

  // Products related
  products: {
    homepage: ['products', 'homepage'] as const,
    search: (params: SearchProductsParams) => ['products', 'search', params] as const,
    detail: (productId: string) => ['products', 'detail', productId] as const,
  },

  categories: {
    all: ['categories', 'all'] as const,
  },

  watchList: {
    all: ['watch-list', 'all'] as const,
    check: (productId: string) => ['watch-list', 'check', productId] as const,
    add: (productId: string) => ['watch-list', 'add', productId] as const,
    remove: (productId: string) => ['watch-list', 'remove', productId] as const,
  },
  questions: {
    list: (productId: string) => ['questions', 'list', productId] as const,
    create: (productId: string) => ['questions', 'create', productId] as const,
    update: (questionId: string) => ['questions', 'update', questionId] as const,
    delete: (questionId: string) => ['questions', 'delete', questionId] as const,
  },
} as const
