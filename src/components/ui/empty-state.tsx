import { ArrowUpRightIcon, BrushCleaning } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

import type { ReactNode } from 'react'

type ActionButton = {
  label: string
  href: string
}

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode

  button1: ActionButton
  button2?: ActionButton

  learnMoreHref?: string
}

export function EmptyState({
  title,
  description,
  icon = <BrushCleaning />,
  button1,
  button2,
  learnMoreHref,
}: EmptyStateProps) {
  return (
    <Empty>
      <EmptyHeader>
        {icon && <EmptyMedia variant='icon'>{icon}</EmptyMedia>}

        <EmptyTitle>{title}</EmptyTitle>

        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>

      <EmptyContent>
        <div className='flex gap-2'>
          <Button asChild>
            <a href={button1.href}>{button1.label}</a>
          </Button>

          {button2 && (
            <Button variant='outline' asChild>
              <a href={button2.href}>{button2.label}</a>
            </Button>
          )}
        </div>
      </EmptyContent>

      {learnMoreHref && (
        <Button variant='link' asChild className='text-muted-foreground' size='sm'>
          <a href={learnMoreHref}>
            Learn More <ArrowUpRightIcon />
          </a>
        </Button>
      )}
    </Empty>
  )
}
