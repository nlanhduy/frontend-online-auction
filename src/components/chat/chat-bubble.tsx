import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Check, CheckCheck } from 'lucide-react'
import React from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

import type { Message } from '@/hooks/use-chat'

interface ChatBubbleProps {
  message: Message
  isCurrentUser: boolean
  showAvatar?: boolean
  showTimestamp?: boolean
  className?: string
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isCurrentUser,
  showAvatar = true,
  showTimestamp = true,
  className,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div
      className={cn(
        'flex gap-2 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300',
        isCurrentUser ? 'flex-row-reverse' : 'flex-row',
        className,
      )}>
      {/* Avatar */}
      {showAvatar && (
        <Avatar className='w-8 h-8 flex-shrink-0 ring-2 ring-border'>
          <AvatarImage src={message.sender.avatar} alt={message.sender.fullName} />
          <AvatarFallback className='text-xs bg-primary/10 text-primary font-semibold'>
            {getInitials(message.sender.fullName)}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message Content */}
      <div
        className={cn(
          'flex flex-col max-w-[70%]',
          isCurrentUser ? 'items-end' : 'items-start',
        )}>
        {/* Sender Name (only show for other users) */}
        {!isCurrentUser && (
          <span className='text-xs text-muted-foreground mb-1 px-1 font-medium'>
            {message.sender.fullName}
          </span>
        )}

        {/* Message Bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-2 break-words shadow-sm',
            'transition-all duration-200 hover:shadow-md',
            isCurrentUser
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-muted text-foreground rounded-bl-sm border border-border',
          )}>
          <p className='text-sm whitespace-pre-wrap leading-relaxed'>{message.content}</p>
        </div>

        {/* Timestamp & Read Status */}
        {showTimestamp && (
          <div className='flex items-center gap-1.5 mt-1 px-1'>
            <span className='text-xs text-muted-foreground'>
              {formatDistanceToNow(new Date(message.createdAt), {
                addSuffix: true,
                locale: vi,
              })}
            </span>
            {isCurrentUser && (
              <span className='text-xs text-muted-foreground flex items-center'>
                {message.isRead ? (
                  <CheckCheck className='w-3.5 h-3.5 text-blue-500' />
                ) : (
                  <Check className='w-3.5 h-3.5' />
                )}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
