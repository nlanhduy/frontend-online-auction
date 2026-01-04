/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { io, Socket } from 'socket.io-client'
import { toast } from 'sonner'

import { ChatAPI } from '@/services/api/chat.api'

import { useAuth, useLogout } from './use-auth'

export interface Message {
  id: string
  content: string
  senderId: string
  sender: { id: string; fullName: string; avatar?: string }
  createdAt: string
  isRead: boolean
}

interface TypingUser {
  userId: string
  fullName: string
  isTyping: boolean
}

interface UseOrderChatOptions {
  pageSize?: number
  onError?: (error: string) => void
  autoConnect?: boolean
  onNewMessage?: (message: Message) => void
}

export const useChat = (orderId: string, options: UseOrderChatOptions = {}) => {
  const { pageSize = 50, onError, autoConnect = true, onNewMessage } = options

  const [messages, setMessages] = useState<Message[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [error, setError] = useState<string | null>(null)

  const socketRef = useRef<Socket | null>(null)
  const { accessToken, user } = useAuth()
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const logout = useLogout()
  const navigate = useNavigate()

  // Fetch messages from REST API (for history & pagination)
  const fetchMessages = useCallback(
    async (page = 1) => {
      try {
        setIsLoading(true)
        setError(null)
        const res = await ChatAPI.getMessages({
          variables: { orderId },
          options: {
            params: {
              page,
              limit: pageSize,
            },
          },
        })

        const fetchedMessages = res.data.messages || []

        if (page === 1) {
          setMessages(fetchedMessages)
        } else {
          // Add older messages at the beginning
          setMessages(prev => [...fetchedMessages, ...prev])
        }

        setHasMore(res.data.hasMore || false)
        setCurrentPage(page)

        return fetchedMessages
      } catch (error: any) {
        const errorMsg = error?.message || 'Failed to fetch messages'
        setError(errorMsg)
        onError?.(errorMsg)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [orderId, pageSize, onError],
  )

  // Initialize WebSocket connection
  useEffect(() => {
    if (!orderId || !autoConnect || !accessToken) return

    const handleJwtError = (data: { message: string; reason: string }) => {
      if (data.reason === 'expired') {
        toast.error('Session expired. Please log in again.')
        logout.mutate()
        navigate('/login')
      }
    }

    const socket = io(`${import.meta.env.VITE_BACKEND_URL}/chat`, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    socketRef.current = socket

    socket.on('jwt_error', handleJwtError)

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id)
      setIsConnected(true)
      setError(null)
      socket.emit('join_order_chat', { orderId })
    })

    socket.on('disconnect', reason => {
      console.log('❌ Socket disconnected:', reason)
      setIsConnected(false)
      if (reason === 'io server disconnect') {
        socket.connect()
      }
    })

    socket.on('connect_error', error => {
      console.error('Socket connection error:', error)
      setError('Connection failed. Retrying...')
      onError?.('Connection failed. Retrying...')
    })

    socket.on('joined_chat', (data: any) => {
      console.log('Joined chat room:', data.roomName)
      setUnreadCount(data.unreadCount || 0)
      ChatAPI.getMessages({
        variables: { orderId },
        options: {
          params: {
            page: 1,
            limit: pageSize,
          },
        },
      })
        .then(res => {
          const fetchedMessages = res.data.messages || []
          setMessages(fetchedMessages)
          setHasMore(res.data.hasMore || false)
          setCurrentPage(1)
        })
        .catch(error => {
          console.error('Failed to fetch initial messages:', error)
        })
    })

    socket.on('new_message', (msg: Message) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev
        return [...prev, msg]
      })

      if (msg.senderId !== user?.id) {
        setUnreadCount(prev => prev + 1)
        onNewMessage?.(msg)
      }
    })

    socket.on(
      'user_typing',
      (data: { userId: string; fullName: string; isTyping: boolean }) => {
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.userId !== data.userId)
          if (data.isTyping) {
            return [
              ...filtered,
              { userId: data.userId, fullName: data.fullName, isTyping: true },
            ]
          }
          return filtered
        })
      },
    )

    socket.on('messages_read', (data: { userId: string }) => {
      if (data.userId !== user?.id) {
        setMessages(prev =>
          prev.map(msg => (msg.senderId === user?.id ? { ...msg, isRead: true } : msg)),
        )
      }
    })

    socket.on('error', (err: any) => {
      console.error('WebSocket error:', err)
      const errorMsg = err.message || 'WebSocket error occurred'
      setError(errorMsg)
      onError?.(errorMsg)
    })

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up socket connection')
      if (socketRef.current) {
        socketRef.current.emit('leave_order_chat', { orderId })
        socketRef.current.off('jwt_error', handleJwtError)
        socketRef.current.disconnect()
        socketRef.current = null
      }
      setIsConnected(false)
    }
  }, [orderId, autoConnect, accessToken])

  // Send message via WebSocket
  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim()) return Promise.reject('Message cannot be empty')
      if (!socketRef.current?.connected) {
        return Promise.reject('Not connected to chat server')
      }

      return new Promise<Message>((resolve, reject) => {
        socketRef.current?.emit(
          'send_message',
          { orderId, content: content.trim() },
          (response: any) => {
            if (response.success) {
              resolve(response.message)
            } else {
              reject(response.error || 'Failed to send message')
            }
          },
        )
      })
    },
    [orderId],
  )

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    try {
      if (!socketRef.current?.connected) {
        // Fallback to REST API
        await ChatAPI.markAsRead({ variables: { orderId } })
      } else {
        // Use WebSocket
        socketRef.current.emit('mark_as_read', { orderId })
      }
      setUnreadCount(0)
    } catch (error: any) {
      onError?.(error?.message || 'Failed to mark as read')
    }
  }, [orderId, onError])

  // Send typing indicator
  const sendTypingIndicator = useCallback(
    (isTyping: boolean) => {
      if (!socketRef.current?.connected) return

      socketRef.current.emit('user_typing', { orderId, isTyping })
    },
    [orderId],
  )

  // Handle typing with debounce
  const handleTyping = useCallback(() => {
    sendTypingIndicator(true)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(false)
    }, 2000)
  }, [sendTypingIndicator])

  // Load more messages (pagination)
  const loadMore = useCallback(() => {
    if (!hasMore || isLoading) return
    fetchMessages(currentPage + 1)
  }, [currentPage, fetchMessages, hasMore, isLoading])

  // Reconnect manually
  const reconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.connect()
    }
  }, [])

  return {
    // State
    messages,
    unreadCount,
    isConnected,
    isLoading,
    hasMore,
    currentPage,
    typingUsers,
    error,

    // Actions
    sendMessage,
    markAsRead,
    loadMore,
    fetchMessages,
    handleTyping,
    reconnect,
  }
}
