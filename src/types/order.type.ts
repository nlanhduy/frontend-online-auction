export const OrderStatus = {
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  SHIPPING_INFO_PENDING: 'SHIPPING_INFO_PENDING',
  SELLER_CONFIRMATION_PENDING: 'SELLER_CONFIRMATION_PENDING',
  IN_TRANSIT: 'IN_TRANSIT',
  BUYER_CONFIRMATION_PENDING: 'BUYER_CONFIRMATION_PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]

export const PaymentStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus]

export const PayoutStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const

export type PayoutStatus = (typeof PayoutStatus)[keyof typeof PayoutStatus]

export interface User {
  id: string
  fullName: string
  email: string
  paypalEmail?: string
}

export interface Order {
  id: string
  productId: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentAmount: number
  paymentAmountVND: number
  platformFee: number
  sellerAmount: number
  paidAt: string | null
  paypalOrderId: string | null
  paypalTransactionId: string | null

  shippingAddress: string | null
  shippingCity: string | null
  shippingDistrict: string | null
  shippingPhone: string | null
  shippingNote: string | null
  shippingSubmittedAt: string | null

  trackingNumber: string | null
  shippingCarrier: string | null
  sellerConfirmedAt: string | null
  shippedAt: string | null

  buyerConfirmedAt: string | null
  receivedAt: string | null

  payoutStatus: PayoutStatus | null
  payoutBatchId: string | null
  payoutAmount: number | null
  payoutCompletedAt: string | null

  isCancelled: boolean
  cancelledBy: string | null
  cancelledAt: string | null
  cancellationReason: string | null

  buyer: User
  seller: User

  createdAt: string
  updatedAt: string
}

export interface PaymentCreateOrderRequest {
  productId: string
}

export interface PaymentCreateOrderResponse {
  success: boolean
  orderId: string
  approvalUrl: string
  amount: number
  amountVND: number
  productName: string
}

export interface PaymentCaptureOrderResponse {
  success: boolean
  message: string
  transactionId: string
  payerEmail: string
  status: string
  order: Order
}

export interface ShippingInfoRequest {
  address: string
  city: string
  district: string
  phone: string
  note?: string
}

export interface ConfirmShipmentRequest {
  trackingNumber: string
  carrier: string
}

export interface CancelOrderRequest {
  reason: string
}

export interface Rating {
  id: string
  value: number // +1 or -1
  comment: string | null
  giverId: string
  receiverId: string
  giver?: User
  receiver?: User
  createdAt: string
  updatedAt: string
}

export interface CreateRatingRequest {
  receiverId: string
  value: number
  comment?: string
}

export interface UpdateRatingRequest {
  value: number
  comment?: string
}

export interface ProductWithOrder {
  id: string
  name: string
  mainImage: string
  currentPrice: number
  status: string
  winnerId: string | null
  sellerId: string
  viewType: 'ORDER_FULFILLMENT' | 'BASIC_INFO'
  message?: string
  order?: Order
  ratings?: {
    buyerRating?: Rating
    sellerRating?: Rating
  }
}
