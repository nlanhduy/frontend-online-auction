'use client'
import { Accordion, AccordionItem } from '@/components/ui/accordion'

import { CategoryAccordionItem } from './category-accordion-item'

import type { Category } from '@/types/category.type'

interface CategoryAccordionProps {
  categories: Category[]
  selectedId: string | null
  onSelect: (category: string) => void
}

export function CategoryAccordion({
  categories,
  selectedId,
  onSelect,
}: CategoryAccordionProps) {
  const parentCategories = categories.filter(cat => !cat.parentId)

  return (
    <Accordion type='single' collapsible className='w-full space-y-2'>
      {parentCategories.map(category => (
        <AccordionItem
          key={category.id}
          value={category.id}
          className='border rounded-md px-4 py-2'>
          <CategoryAccordionItem
            category={category}
            isSelected={selectedId === category.id}
            onSelect={onSelect}
          />
        </AccordionItem>
      ))}
    </Accordion>
  )
}
