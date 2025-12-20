'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { categorySchema } from '@/lib/validation/category'
import { zodResolver } from '@hookform/resolvers/zod'

import type { CategoryFormData, CategoryFormInput } from '@/lib/validation/category'
import type { Category } from '@/types/category.type'
interface CategoryFormProps {
  category: Category | null
  parentId: string | null
  categories: Category[]
  onSave: (data: CategoryFormData) => void
  onCancel: () => void
  isCreating?: boolean
  isUpdating?: boolean
}

export function CategoryForm({
  category,
  parentId,
  categories,
  onSave,
  onCancel,
  isCreating,
  isUpdating,
}: CategoryFormProps) {
  const isCreatingSubcategory = Boolean(parentId && !category)
  const isEditingWithChildren = Boolean(category?.children?.length)

  const form = useForm<CategoryFormInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      parentId: category?.parentId || parentId || undefined,
    },
  })

  // Reset form when category or parentId changes
  useEffect(() => {
    form.reset({
      name: category?.name || '',
      description: category?.description || '',
      parentId: category?.parentId || parentId || undefined,
    })
  }, [category, parentId, form])

  const handleSubmit = form.handleSubmit(rawData => {
    const data = categorySchema.parse(rawData)
    onSave(data)
  })

  const parentCategories = categories.filter(
    cat => !cat.parentId && cat.id !== category?.id,
  )

  const selectedParentId = form.watch('parentId')

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      {/* Name */}
      <div className='space-y-2'>
        <Label htmlFor='name'>
          Category Name <span className='text-destructive'>*</span>
        </Label>
        <Input
          id='name'
          {...form.register('name')}
          placeholder='Enter category name'
          disabled={form.formState.isSubmitting}
          aria-invalid={!!form.formState.errors.name}
        />
        {form.formState.errors.name && (
          <p className='text-sm text-destructive'>{form.formState.errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div className='space-y-2'>
        <Label htmlFor='description'>Description</Label>
        <Textarea
          id='description'
          {...form.register('description')}
          placeholder='Enter category description (optional)'
          disabled={form.formState.isSubmitting}
          rows={3}
          aria-invalid={!!form.formState.errors.description}
        />
        {form.formState.errors.description && (
          <p className='text-sm text-destructive'>
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      {/* Parent Category */}
      <div className='space-y-2 w-full'>
        {isEditingWithChildren ? (
          <div className='rounded-md bg-muted p-3'>
            <Label className='text-muted-foreground'>Parent Category</Label>
            <p className='text-sm text-muted-foreground mt-1'>
              This category has subcategories and cannot be assigned a parent category.
            </p>
          </div>
        ) : (
          <>
            <Label htmlFor='parent'>Parent Category</Label>
            <Select
              value={selectedParentId || 'none'}
              onValueChange={value => {
                form.setValue('parentId', value === 'none' ? undefined : value, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }}
              disabled={form.formState.isSubmitting || isCreatingSubcategory}>
              <SelectTrigger
                id='parent'
                className='w-full'
                aria-invalid={!!form.formState.errors.parentId}>
                <SelectValue placeholder='Select a parent category (optional)' />
              </SelectTrigger>

              <SelectContent>
                {!isCreatingSubcategory && (
                  <SelectItem value='none'>No parent (root category)</SelectItem>
                )}

                {parentCategories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isCreatingSubcategory && (
              <p className='text-xs text-muted-foreground mt-1'>
                Parent category is preselected for subcategory.
              </p>
            )}

            {form.formState.errors.parentId && (
              <p className='text-sm text-destructive'>
                {form.formState.errors.parentId.message}
              </p>
            )}
          </>
        )}
      </div>

      {/* Actions */}
      <div className='flex gap-3 pt-4'>
        <Button
          type='submit'
          disabled={!form.formState.isDirty || isCreating || isUpdating}
          className='flex-1'>
          {isCreating || (isUpdating && <Spinner className='mr-2' />)}
          {isCreating
            ? 'Creating...'
            : isUpdating
              ? 'Saving...'
              : category
                ? 'Update Category'
                : 'Create Category'}
        </Button>
        <Button
          type='button'
          variant='outline'
          onClick={onCancel}
          disabled={form.formState.isSubmitting || isCreating || isUpdating}>
          Cancel
        </Button>
      </div>

      {/* Form Status */}
      {form.formState.errors.root && (
        <p className='text-sm text-destructive text-center'>
          {form.formState.errors.root.message}
        </p>
      )}
    </form>
  )
}
