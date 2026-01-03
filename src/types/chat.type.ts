export interface ChatMessage {
  id: string
  orderId: string
  senderId: string
  senderName: string
  senderRole: 'bidder' | 'seller'
  message: string
  timestamp: string
  createdAt: string
}

export interface SendMessageRequest {
  message: string
}

export interface SendMessageResponse {
  message: ChatMessage
}

export interface GetMessagesResponse {
  messages: ChatMessage[]
}
