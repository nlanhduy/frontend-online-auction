'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CategoryTagProps {
  name: string
  onClick?: () => void
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md'
  className?: string
}

export function CategoryTag({
  name,
  onClick,
  variant = 'default',
  size = 'sm',
  className,
}: CategoryTagProps) {
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  }

  const variantClasses = {
    default: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    outline: 'border border-blue-300 text-blue-700 hover:bg-blue-50',
    ghost: 'text-blue-600 hover:bg-blue-50',
  }

  return (
    <Button
      onClick={onClick}
      className={cn(
        'rounded-full font-medium cursor-pointer',
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      variant='ghost'>
      {name}
    </Button>
  )
}
