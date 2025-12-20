'use client'

import type React from 'react'

import { useState } from 'react'

import { CategoryNode } from './category-node'

import type { Category } from '@/types/category.type'

interface CategoryTreeProps {
  categories: Category[]
  selectedId?: string
  onSelect: (category: Category) => void
  onEdit: (categoryId: string) => void
  onDelete: (categoryId: string) => void
}

export function CategoryTree({
  categories,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}: CategoryTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedIds(newExpanded)
  }

  const renderNodes = (nodes: Category[], level = 0): React.ReactNode => {
    return nodes.map(category => (
      <CategoryNode
        key={category.id}
        category={category}
        level={level}
        isExpanded={expandedIds.has(category.id)}
        onToggleExpanded={toggleExpanded}
        isSelected={selectedId === category.id}
        onSelect={onSelect}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ))
  }

  return <div className='space-y-1'>{renderNodes(categories)}</div>
}
