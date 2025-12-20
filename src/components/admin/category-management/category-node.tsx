'use client'

import type { Category } from '@/types/category.type'
import { ChevronRight, Edit2, Folder, FolderOpen, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CategoryNodeProps {
  category: Category
  level: number
  isExpanded: boolean
  onToggleExpanded: (id: string) => void
  isSelected: boolean
  onSelect: (category: Category) => void
  onEdit: (categoryId: string) => void
  onDelete: (categoryId: string) => void
}

export function CategoryNode({
  category,
  level,
  isExpanded,
  onToggleExpanded,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: CategoryNodeProps) {
  const hasChildren = category.children && category.children.length > 0

  return (
    <>
      <div
        className={cn(
          'flex items-center gap-1 rounded-md px-2 py-2 transition-colors',
          isSelected ? 'bg-primary/10' : 'hover:bg-muted',
        )}
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}>
        {hasChildren ? (
          <button
            onClick={() => onToggleExpanded(category.id)}
            className='flex h-6 w-6 items-center justify-center rounded hover:bg-muted'>
            <ChevronRight
              className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-90')}
            />
          </button>
        ) : (
          <div className='w-6' />
        )}

        <button
          onClick={() => onSelect(category)}
          className={cn(
            'flex flex-1 items-center gap-2 rounded px-2 py-1 text-sm text-left',
            isSelected ? 'text-foreground' : 'text-foreground/70 hover:text-foreground',
          )}>
          {hasChildren ? (
            isExpanded ? (
              <FolderOpen className='h-4 w-4 flex-shrink-0 text-primary' />
            ) : (
              <Folder className='h-4 w-4 flex-shrink-0 text-muted-foreground' />
            )
          ) : (
            <Folder className='h-4 w-4 flex-shrink-0 text-muted-foreground' />
          )}
          <span className='truncate'>{category.name}</span>
          {hasChildren && (
            <span className='ml-auto text-xs text-muted-foreground'>
              {category.children!.length}
            </span>
          )}
        </button>

        <div className='flex gap-1'>
          <Button
            size='sm'
            variant='ghost'
            onClick={e => {
              e.stopPropagation()
              onEdit(category.id)
            }}
            className='h-6 w-6 p-0'>
            <Edit2 className='h-3 w-3' />
          </Button>
          <Button
            size='sm'
            variant='ghost'
            onClick={e => {
              e.stopPropagation()
              onDelete(category.id)
            }}
            className='h-6 w-6 p-0 text-destructive hover:text-destructive'>
            <Trash2 className='h-3 w-3' />
          </Button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <>
          {category.children!.map(child => (
            <CategoryNode
              key={child.id}
              category={child}
              level={level + 1}
              isExpanded={isExpanded}
              onToggleExpanded={onToggleExpanded}
              isSelected={isSelected}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </>
      )}
    </>
  )
}
