'use client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { CategoryForm } from './category-form'

import type { Category } from '@/types/category.type'
import type { CategoryFormData } from '@/lib/validation/category'

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: Category | null
  parentId: string | null
  categories: Category[]
  onSave: (data: CategoryFormData) => void
  isCreating: boolean
  isUpdating: boolean
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  parentId,
  categories,
  onSave,
  isCreating,
  isUpdating,
}: CategoryDialogProps) {
  const isEditing = !!category

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? 'Edit Category'
              : parentId
                ? 'Create Subcategory'
                : 'Create Category'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the category details below.'
              : parentId
                ? 'Create a new subcategory under the selected parent.'
                : 'Create a new parent category.'}
          </DialogDescription>
        </DialogHeader>
        <CategoryForm
          category={category}
          parentId={parentId}
          categories={categories}
          onSave={data => {
            onSave(data)
            onOpenChange(false)
          }}
          onCancel={() => onOpenChange(false)}
          isCreating={isCreating}
          isUpdating={isUpdating}
        />
      </DialogContent>
    </Dialog>
  )
}
