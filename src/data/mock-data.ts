import type { Category } from '@/types/category.type'
import type { Product } from '@/types/product.type'

export interface HomePageProductsResponse {
  endingSoon: Product[]
  mostBids: Product[]
  highestPriced: Product[]
}

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Điện tử' },
  { id: '2', name: 'Thời trang' },
  { id: '3', name: 'Phụ kiện' },
  { id: '4', name: 'Sách' },
  { id: '5', name: 'Đồ gia dụng' },
  { id: '6', name: 'Thể thao' },
]

const generateRandomDate = (hoursFromNow: number) => {
  const date = new Date()
  date.setHours(date.getHours() + hoursFromNow)
  return date.toISOString()
}

const isNewProduct = (createdAt: string) => {
  const now = new Date()
  const created = new Date(createdAt)
  const diffInMinutes = (now.getTime() - created.getTime()) / (1000 * 60)
  return diffInMinutes < 30
}

// Mock data cho development (nếu cần)
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prd-001',
    name: 'iPhone 15 Pro Max 256GB',
    mainImage: 'iphone15_1.jpg',
    thumbnails: ['iphone15_1.jpg', 'iphone15_2.jpg', 'iphone15_3.jpg'],
    currentPrice: 1200,
    buyNowPrice: 1500,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    endTime: generateRandomDate(72),
    timeRemaining: 72 * 60 * 60 * 1000,
    totalBids: 15,
    highestBidder: 'Nguyễn A',
    category: {
      id: '75d398be-c79a-4449-afd0-43fb0bc44e04',
      name: 'Phones',
    },
  },
  {
    id: 'prd-002',
    name: 'Samsung Galaxy S24 Ultra',
    mainImage: 's24ultra.jpg',
    thumbnails: ['s24ultra_1.jpg', 's24ultra_2.jpg', 's24ultra_3.jpg'],
    currentPrice: 1000,
    buyNowPrice: 1300,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: generateRandomDate(48),
    timeRemaining: 48 * 60 * 60 * 1000,
    totalBids: 8,
    highestBidder: 'Trần B',
    category: {
      id: '75d398be-c79a-4449-afd0-43fb0bc44e04',
      name: 'Phones',
    },
  },
  {
    id: 'prd-003',
    name: 'iPhone 13 128GB (Used)',
    mainImage: 'iphone13_used.jpg',
    thumbnails: ['iphone13_used_1.jpg', 'iphone13_used_2.jpg', 'iphone13_used_3.jpg'],
    currentPrice: 410,
    buyNowPrice: 550,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: generateRandomDate(120),
    timeRemaining: 120 * 60 * 60 * 1000,
    totalBids: 22,
    highestBidder: 'Lê C',
    category: {
      id: '75d398be-c79a-4449-afd0-43fb0bc44e04',
      name: 'Phones',
    },
  },
  {
    id: 'prd-006',
    name: 'Google Pixel 8 Pro',
    mainImage: 'pixel8pro.jpg',
    thumbnails: ['pixel8pro_1.jpg', 'pixel8pro_2.jpg', 'pixel8pro_3.jpg'],
    currentPrice: 900,
    buyNowPrice: 1200,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: generateRandomDate(36),
    timeRemaining: 36 * 60 * 60 * 1000,
    totalBids: 5,
    highestBidder: null,
    category: {
      id: '75d398be-c79a-4449-afd0-43fb0bc44e04',
      name: 'Phones',
    },
  },
  {
    id: 'prd-008',
    name: 'Samsung Z Fold 5',
    mainImage: 'zfold5.jpg',
    thumbnails: ['zfold5_1.jpg', 'zfold5_2.jpg', 'zfold5_3.jpg'],
    currentPrice: 1200,
    buyNowPrice: 1600,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    endTime: generateRandomDate(60),
    timeRemaining: 60 * 60 * 60 * 1000,
    totalBids: 3,
    highestBidder: null,
    category: {
      id: '75d398be-c79a-4449-afd0-43fb0bc44e04',
      name: 'Phones',
    },
  },
]

export function getProductsWithNewBadge(products: Product[]) {
  return products.map(product => ({
    ...product,
    isNew: isNewProduct(product.createdAt),
  }))
}

// Mock homepage data
export const MOCK_HOMEPAGE_DATA: HomePageProductsResponse = {
  endingSoon: MOCK_PRODUCTS.slice(0, 3),
  mostBids: MOCK_PRODUCTS.slice(1, 4),
  highestPriced: MOCK_PRODUCTS.slice(0, 5),
}
