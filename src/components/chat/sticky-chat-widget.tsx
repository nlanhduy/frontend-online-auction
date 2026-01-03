import { MessageCircle, Minimize2, X } from 'lucide-react'
import React, { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { ChatBox } from './chat-box'

interface StickyChatWidgetProps {
  orderId: string
  className?: string
  defaultOpen?: boolean
}

export const StickyChatWidget: React.FC<StickyChatWidgetProps> = ({
  orderId,
  className,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [isMinimized, setIsMinimized] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const handleToggle = () => {
    if (!isOpen) {
      setIsOpen(true)
      setIsMinimized(false)
      setUnreadCount(0)
    } else {
      setIsOpen(false)
      setIsMinimized(false)
    }
  }

  const handleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  const handleClose = () => {
    setIsOpen(false)
    setIsMinimized(false)
  }

  const handleNewMessage = () => {
    if (!isOpen || isMinimized) {
      setUnreadCount(prev => prev + 1)
    }
  }

  return (
    <>
      {/* Floating Chat Button - Bottom Right */}
      {!isOpen && (
        <Button
          onClick={handleToggle}
          size='icon'
          className={cn(
            'fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50',
            'hover:scale-110 transition-transform',
            'bg-primary hover:bg-primary/90',
            className,
          )}>
          <div className='relative'>
            <MessageCircle className='h-6 w-6' />
            {unreadCount > 0 && (
              <Badge
                variant='destructive'
                className='absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs'>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </div>
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card
          className={cn(
            'fixed bottom-6 right-6 z-50 py-0!',
            'shadow-2xl border-border',
            'transition-all duration-300 ease-in-out',
            isMinimized ? 'h-14' : 'h-[600px]',
            'w-[400px] max-w-[calc(100vw-3rem)]',
            'flex flex-col overflow-hidden',
            'bg-background',
          )}>
          {/* Chat Header */}
          <div className='flex items-center justify-between px-4 py-3 border-b border-border bg-card'>
            <div className='flex items-center gap-2'>
              <MessageCircle className='h-5 w-5 text-primary' />
              <h3 className='font-semibold text-foreground'>Chat Support</h3>
            </div>
            <div className='flex items-center gap-1'>
              <Button
                variant='ghost'
                size='icon'
                onClick={handleMinimize}
                className='h-8 w-8 text-muted-foreground hover:text-foreground'>
                <Minimize2 className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                onClick={handleClose}
                className='h-8 w-8 text-muted-foreground hover:text-foreground'>
                <X className='h-4 w-4' />
              </Button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <div className='flex-1 overflow-hidden'>
              <ChatBox
                orderId={orderId}
                className='border-0 rounded-none h-full'
                height='100%'
                showHeader={false}
                autoMarkAsRead={true}
                onNewMessage={handleNewMessage}
              />
            </div>
          )}
        </Card>
      )}
    </>
  )
}
