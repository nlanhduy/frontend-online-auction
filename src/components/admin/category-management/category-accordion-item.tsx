'use client'

import { Folder, FolderOpen } from 'lucide-react'

import { AccordionContent, AccordionTrigger } from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

import type { Category } from '@/types/category.type'

interface CategoryAccordionItemProps {
  category: Category
  isSelected: boolean
  onSelect: (category: string) => void
}

export function CategoryAccordionItem({
  category,
  isSelected,
  onSelect,
}: CategoryAccordionItemProps) {
  const hasChildren = category.children && category.children.length > 0

  return (
    <>
      <AccordionTrigger
        onClick={() => onSelect(category.id)}
        className={cn(
          'flex gap-2 hover:no-underline',
          isSelected ? 'text-primary font-medium' : 'text-foreground',
        )}>
        <div className='flex items-center gap-2'>
          {hasChildren ? (
            <FolderOpen className='h-4 w-4 text-primary flex-shrink-0' />
          ) : (
            <Folder className='h-4 w-4 text-muted-foreground flex-shrink-0' />
          )}
          <span className='truncate'>{category.name}</span>
          {hasChildren && (
            <span className='text-xs text-muted-foreground ml-2'>
              ({category.children!.length})
            </span>
          )}
        </div>
      </AccordionTrigger>

      {hasChildren && (
        <AccordionContent className='space-y-2 pt-2 pb-0'>
          {category.children!.map(child => (
            <div
              key={child.id}
              onClick={() => onSelect(child.id)}
              className={cn(
                'ml-6 px-3 py-2 rounded-md text-sm flex items-center gap-2 cursor-pointer transition-colors',
                isSelected && child.id === category.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-muted text-foreground/80',
              )}>
              <Folder className='h-3.5 w-3.5 text-muted-foreground flex-shrink-0' />
              <span className='truncate flex-1'>{child.name}</span>
            </div>
          ))}
        </AccordionContent>
      )}
    </>
  )
}
