/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loader2, RefreshCw, Send, WifiOff } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { useChat } from '@/hooks/use-chat'
import { cn, handleApiError } from '@/lib/utils'

import { ChatBubble } from './chat-bubble'

interface ChatBoxProps {
  orderId: string
  className?: string
  height?: string
  showHeader?: boolean
  autoMarkAsRead?: boolean
  onNewMessage?: (message: any) => void
}

export const ChatBox: React.FC<ChatBoxProps> = ({
  orderId,
  className,
  height = '500px',
  showHeader = true,
  autoMarkAsRead = true,
  onNewMessage,
}) => {
  const { user } = useAuth()
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isUserScrollingRef = useRef(false)

  const {
    messages,
    unreadCount,
    isConnected,
    isLoading,
    hasMore,
    typingUsers,
    error,
    sendMessage,
    markAsRead,
    loadMore,
    handleTyping,
    reconnect,
  } = useChat(orderId, {
    pageSize: 50,
    onError: (err: any) => handleApiError(err),
    onNewMessage,
  })

  // Auto-scroll to bottom on new messages
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
    })
  }

  useEffect(() => {
    if (!isUserScrollingRef.current) {
      scrollToBottom()
    }
  }, [messages])

  // Auto mark as read when messages are visible
  useEffect(() => {
    if (autoMarkAsRead && unreadCount > 0 && isConnected) {
      const timer = setTimeout(() => {
        markAsRead()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [unreadCount, isConnected, autoMarkAsRead, markAsRead])

  // Handle scroll to detect user scrolling
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    const isAtBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight < 50

    isUserScrollingRef.current = !isAtBottom

    // Load more when scrolling to top
    if (element.scrollTop === 0 && hasMore && !isLoading) {
      loadMore()
    }
  }

  // Send message handler
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) return

    const content = inputValue.trim()
    setInputValue('')
    setIsSending(true)

    try {
      await sendMessage(content)
      scrollToBottom()
    } catch (err: any) {
      handleApiError(err)
      setInputValue(content) // Restore input on error
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    handleTyping()
  }

  const typingUsersDisplay = typingUsers.filter((t: any) => t.userId !== user?.id)

  return (
    <div
      className={cn(
        'flex flex-col border border-border rounded-lg bg-background',
        className,
      )}
      style={{ height }}>
      {/* Header */}
      {showHeader && (
        <div className='flex items-center justify-between px-4 py-3 border-b border-border bg-card'>
          <div className='flex items-center gap-2'>
            <div
              className={cn(
                'w-2 h-2 rounded-full',
                isConnected ? 'bg-green-500' : 'bg-red-500',
              )}
            />
            <h3 className='font-semibold text-foreground'>Chat</h3>
            {unreadCount > 0 && (
              <span className='px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full'>
                {unreadCount}
              </span>
            )}
          </div>

          {!isConnected && (
            <Button
              variant='ghost'
              size='sm'
              onClick={reconnect}
              className='text-muted-foreground hover:text-foreground'>
              <RefreshCw className='w-4 h-4 mr-1' />
              Reconnect
            </Button>
          )}
        </div>
      )}

      {/* Connection Error Alert */}
      {!isConnected && (
        <Alert variant='destructive' className='m-4 mb-0 rounded-lg'>
          <WifiOff className='w-4 h-4' />
          <AlertDescription>
            Disconnected from chat server. Messages will not update in real-time.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && isConnected && (
        <Alert variant='destructive' className='m-4 mb-0 rounded-lg'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Messages */}
      <div className='flex-1 overflow-hidden relative'>
        <div
          ref={scrollAreaRef}
          className='h-full overflow-y-auto px-4 scroll-smooth'
          onScroll={handleScroll}
          style={{ scrollBehavior: 'smooth' }}>
          {/* Load More Indicator */}
          {hasMore && (
            <div className='flex justify-center py-2'>
              <Button
                variant='ghost'
                size='sm'
                onClick={loadMore}
                disabled={isLoading}
                className='text-muted-foreground hover:text-foreground'>
                {isLoading ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    Loading...
                  </>
                ) : (
                  'Load older messages'
                )}
              </Button>
            </div>
          )}

          {/* Messages List */}
          <div className='space-y-1 py-4'>
            {messages.length === 0 && !isLoading ? (
              <div className='flex items-center justify-center h-32 text-muted-foreground'>
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((message: any) => (
                <ChatBubble
                  key={message.id}
                  message={message}
                  isCurrentUser={message.senderId === user?.id}
                />
              ))
            )}

            {/* Typing Indicator */}
            {typingUsersDisplay.length > 0 && (
              <div className='flex items-center gap-2 text-sm text-muted-foreground px-2 py-2'>
                <div className='flex gap-1'>
                  <span className='w-2 h-2 bg-primary rounded-full animate-bounce' />
                  <span className='w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]' />
                  <span className='w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]' />
                </div>
                <span>
                  {typingUsersDisplay.length === 1
                    ? `${typingUsersDisplay[0].fullName} is typing...`
                    : `${typingUsersDisplay.length} people are typing...`}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input */}
      <div className='flex items-center gap-2 p-4 border-t border-border bg-card'>
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder='Type a message...'
          disabled={!isConnected || isSending}
          className='flex-1 bg-background border-input'
        />
        <Button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || !isConnected || isSending}
          size='icon'
          className='bg-primary hover:bg-primary/90'>
          {isSending ? (
            <Loader2 className='w-4 h-4 animate-spin' />
          ) : (
            <Send className='w-4 h-4' />
          )}
        </Button>
      </div>
    </div>
  )
}
