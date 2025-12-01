export interface Category {
  id: string
  name: string
}

export interface Product {
  id: string
  name: string
  description: string
  currentPrice: number
  initialPrice: number
  buyNowPrice?: number
  images: string[]
  categoryId: string
  categoryName: string
  sellerId: string
  sellerName: string
  createdAt: Date
  endTime: Date
  bidCount: number
  highestBidder?: string
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
  return date
}

const isNewProduct = (createdAt: Date) => {
  const now = new Date()
  const diffInMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60)
  return diffInMinutes < 30
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max - Chính hãng',
    description:
      'Điện thoại iPhone 15 Pro Max 256GB, màu Space Black, nguyên hộp, chưa active',
    currentPrice: 22000000,
    initialPrice: 20000000,
    buyNowPrice: 25000000,
    images: ['/iphone-15-pro.jpg'],
    categoryId: '1',
    categoryName: 'Điện tử',
    sellerId: 'seller1',
    sellerName: 'TechStore Việt',
    createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 phút trước - SẢN PHẨM MỚI
    endTime: generateRandomDate(72),
    bidCount: 15,
    highestBidder: 'Nguyễn A',
  },
  {
    id: '2',
    name: 'Áo khoác Adidas chính hãng',
    description: 'Áo khoác Adidas Originals, kích thước M, màu đen, hàng mới 100%',
    currentPrice: 1200000,
    initialPrice: 1000000,
    buyNowPrice: 1500000,
    images: ['/adidas-jacket.jpg'],
    categoryId: '2',
    categoryName: 'Thời trang',
    sellerId: 'seller2',
    sellerName: 'Fashion Hub',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    endTime: generateRandomDate(48),
    bidCount: 8,
    highestBidder: 'Trần B',
  },
  {
    id: '3',
    name: 'Đồng hồ Thụy Sỹ Tissot',
    description: 'Đồng hồ nam Tissot PRX T137, dây thép không gỉ, chống nước 100m',
    currentPrice: 15000000,
    initialPrice: 12000000,
    buyNowPrice: 18000000,
    images: ['/tissot-watch.jpg'],
    categoryId: '3',
    categoryName: 'Phụ kiện',
    sellerId: 'seller3',
    sellerName: 'Luxury Watch',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    endTime: generateRandomDate(120),
    bidCount: 22,
    highestBidder: 'Lê C',
  },
  {
    id: '4',
    name: 'Sách Sapiens - Yuval Noah Harari',
    description: 'Sách Sapiens bản tiếng Việt, in lần thứ 5, tình trạng như mới',
    currentPrice: 300000,
    initialPrice: 250000,
    images: ['/sapiens-book.jpg'],
    categoryId: '4',
    categoryName: 'Sách',
    sellerId: 'seller4',
    sellerName: 'Nhà sách Online',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    endTime: generateRandomDate(36),
    bidCount: 5,
  },
  {
    id: '5',
    name: 'Nồi cơm điện Toshiba RC-18Vs',
    description: 'Nồi cơm 1.8L, chức năng hâm nóng tự động, bảo hành 2 năm',
    currentPrice: 2500000,
    initialPrice: 2000000,
    buyNowPrice: 3000000,
    images: ['/toshiba-rice-cooker.jpg'],
    categoryId: '5',
    categoryName: 'Đồ gia dụng',
    sellerId: 'seller5',
    sellerName: 'Home Appliance Store',
    createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 phút trước - SẢN PHẨM MỚI
    endTime: generateRandomDate(60),
    bidCount: 3,
  },
  {
    id: '6',
    name: 'Vợt cầu lông Yonex Nanoray',
    description: 'Vợt cầu lông chuyên nghiệp, trọng lượng 83g, cho người chơi trung cấp',
    currentPrice: 800000,
    initialPrice: 600000,
    buyNowPrice: 1000000,
    images: ['/yonex-badminton.jpg'],
    categoryId: '6',
    categoryName: 'Thể thao',
    sellerId: 'seller6',
    sellerName: 'Sports Pro',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    endTime: generateRandomDate(24),
    bidCount: 2,
  },
  {
    id: '7',
    name: 'Laptop Dell XPS 13',
    description: 'Laptop Dell XPS 13 FHD, Intel i5-1340P, RAM 16GB, SSD 512GB, pin 52Wh',
    currentPrice: 18000000,
    initialPrice: 15000000,
    buyNowPrice: 20000000,
    images: ['/dell-laptop.jpg'],
    categoryId: '1',
    categoryName: 'Điện tử',
    sellerId: 'seller1',
    sellerName: 'TechStore Việt',
    createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 phút trước - SẢN PHẨM MỚI NHẤT
    endTime: generateRandomDate(96),
    bidCount: 18,
    highestBidder: 'Phạm D',
  },
  {
    id: '8',
    name: 'Giày Nike Air Jordan 1',
    description: 'Giày thể thao Nike Air Jordan 1 Retro, size 42, hàng chính hãng',
    currentPrice: 2800000,
    initialPrice: 2200000,
    buyNowPrice: 3500000,
    images: ['/nike-jordan.jpg'],
    categoryId: '2',
    categoryName: 'Thời trang',
    sellerId: 'seller7',
    sellerName: 'Sneaker Store',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    endTime: generateRandomDate(54),
    bidCount: 12,
    highestBidder: 'Vũ E',
  },
]

export function getProductsWithNewBadge(products: Product[]) {
  return products.map(product => ({
    ...product,
    isNew: isNewProduct(product.createdAt),
  }))
}
