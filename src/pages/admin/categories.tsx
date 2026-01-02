'use client'

import { Plus } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { CategoryAccordion } from '@/components/admin/category-management/category-accordion'
import { CategoryDialog } from '@/components/admin/category-management/category-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useCategories } from '@/hooks/use-categories'
import { formatReadableDate } from '@/lib/utils'

import type { Category } from '@/types/category.type'
import type { CategoryFormData } from '@/lib/validation/category'
export function AdminCategories() {
  const {
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    isFetchingCategories,

    createCategoryMutation,
    updateCategoryMutation,
    deleteCategoryMutation,
  } = useCategories()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [parentIdForSubcategory, setParentIdForSubcategory] = useState<string | null>(
    null,
  )

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)

  const handleCreate = useCallback(() => {
    setEditingId(null)
    setParentIdForSubcategory(null)
    setSelectedCategoryId(null)
    setIsDialogOpen(true)
  }, [setSelectedCategoryId])

  const handleCreateSubcategory = useCallback(
    (parentId: string) => {
      setEditingId(null)
      setParentIdForSubcategory(parentId)
      setSelectedCategoryId(null)
      setIsDialogOpen(true)
    },
    [setSelectedCategoryId],
  )

  const handleEdit = useCallback(
    (categoryId: string) => {
      setSelectedCategoryId(categoryId)
      setEditingId(categoryId)
      setParentIdForSubcategory(null)
      setIsDialogOpen(true)
    },
    [categories, setSelectedCategoryId],
  )

  const handleSave = useCallback(
    (data: CategoryFormData) => {
      if (editingId) {
        updateCategoryMutation.mutate(
          { id: editingId, data },
          {
            onSuccess: () => {
              setSelectedCategoryId(editingId)
              setIsDialogOpen(false)
            },
          },
        )
      } else {
        createCategoryMutation.mutate(data, {
          onSuccess: () => {
            setIsDialogOpen(false)
          },
        })
      }
      setEditingId(null)
      setParentIdForSubcategory(null)
    },
    [editingId, createCategoryMutation, updateCategoryMutation],
  )

  const handleDeleteClick = useCallback(
    (categoryId: string) => {
      const category = categories.find((c: Category) => c.id === categoryId)
      if (!category) return

      setCategoryToDelete(category)
      setShowDeleteDialog(true)
    },
    [categories],
  )

  const handleConfirmDelete = useCallback(() => {
    if (!categoryToDelete) return

    deleteCategoryMutation.mutate(categoryToDelete.id)
    setSelectedCategoryId(null)
    setShowDeleteDialog(false)
    setCategoryToDelete(null)
  }, [categoryToDelete, deleteCategoryMutation, setSelectedCategoryId])

  const navigate = useNavigate()

  const hasChildren = Boolean(categoryToDelete?.children?.length)

  const selectedCategory = categories.find(
    (cat: Category) => cat.id === selectedCategoryId,
  )
  console.log({ selectedCategoryId })

  if (isFetchingCategories && selectedCategory === undefined) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Spinner className='h-6 w-6' />
      </div>
    )
  }

  const isDeleting = deleteCategoryMutation.isPending
  const hasProducts = selectedCategory?.numsOfProducts > 0

  const isDisabled = isDeleting || selectedCategory?.children?.length > 0 || hasProducts

  const tooltipMessage = isDeleting
    ? 'Deleting category...'
    : hasChildren
      ? 'Cannot delete this category because it has subcategories'
      : hasProducts
        ? 'Cannot delete this category because it contains products'
        : ''

  return (
    <>
      <div className='min-h-screen bg-background'>
        {/* Header */}
        <div className='border-b bg-card'>
          <div className='mx-auto max-w-7xl px-4 py-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-3xl font-bold'>Category Management</h1>
                <p className='mt-2 text-sm text-muted-foreground'>
                  Manage your hierarchical category structure
                </p>
              </div>

              <Button
                onClick={handleCreate}
                className='gap-2'
                disabled={createCategoryMutation.isPending}>
                <Plus className='h-4 w-4' />
                New Category
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='mx-auto max-w-7xl px-4 py-8'>
          <div className='grid gap-6 lg:grid-cols-3'>
            {/* Tree */}
            <div className='lg:col-span-2'>
              <div className='rounded-lg border bg-card p-6'>
                <h2 className='mb-4 text-lg font-semibold'>Categories</h2>

                <CategoryAccordion
                  categories={categories}
                  selectedId={selectedCategoryId}
                  onSelect={setSelectedCategoryId}
                />
              </div>
            </div>

            {/* Details */}
            <div className='lg:col-span-1'>
              <div className='rounded-lg border bg-card p-6'>
                <h2 className='mb-4 text-lg font-semibold'>Details</h2>

                {selectedCategoryId ? (
                  <div className='space-y-4'>
                    <div>
                      <p className='text-xs uppercase text-muted-foreground'>Id</p>
                      <p
                        className='text-sm font-medium cursor-pointer text-primary hover:underline'
                        onClick={() => navigate(`/category/${selectedCategory.id}`)}>
                        {selectedCategory.id}
                      </p>
                    </div>

                    <div>
                      <p className='text-xs uppercase text-muted-foreground'>Name</p>
                      <p className='text-sm font-medium'>{selectedCategory.name}</p>
                    </div>

                    {selectedCategory.description && (
                      <div>
                        <p className='text-xs uppercase text-muted-foreground'>
                          Description
                        </p>
                        <p className='text-sm'>{selectedCategory.description}</p>
                      </div>
                    )}

                    <div>
                      <p className='text-xs uppercase text-muted-foreground'>
                        Subcategories
                      </p>
                      <p className='text-sm'>{selectedCategory?.children?.length || 0}</p>
                    </div>

                    <div>
                      <p className='text-xs uppercase text-muted-foreground'>
                        Number of products
                      </p>
                      <p className='text-sm'>{selectedCategory.numsOfProducts}</p>
                    </div>

                    <div>
                      <p className='text-xs uppercase text-muted-foreground'>
                        Created at
                      </p>
                      <p className='text-sm'>
                        {formatReadableDate(selectedCategory?.createdAt)}
                      </p>
                    </div>

                    <div>
                      <p className='text-xs uppercase text-muted-foreground'>
                        Updated at
                      </p>
                      <p className='text-sm'>
                        {formatReadableDate(selectedCategory?.updatedAt)}
                      </p>
                    </div>

                    <div className='border-t pt-4 space-y-2'>
                      <Button
                        onClick={() => handleEdit(selectedCategory.id)}
                        className='w-full'
                        disabled={updateCategoryMutation.isPending}>
                        Edit
                      </Button>

                      {!selectedCategory.parentId && (
                        <Button
                          onClick={() => handleCreateSubcategory(selectedCategory.id)}
                          variant='outline'
                          className='w-full'
                          disabled={createCategoryMutation.isPending}>
                          Create Subcategory
                        </Button>
                      )}

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className='w-full'>
                              <Button
                                onClick={() => handleDeleteClick(selectedCategory.id)}
                                variant='destructive'
                                className='w-full'
                                disabled={isDisabled}>
                                Delete
                              </Button>
                            </span>
                          </TooltipTrigger>

                          {isDisabled && (
                            <TooltipContent side='top'>
                              <p>{tooltipMessage}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ) : (
                  <div className='border-2 border-dashed rounded-lg py-8 text-center text-sm text-muted-foreground'>
                    Select a category to view details
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dialog */}
        <CategoryDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          category={editingId ? selectedCategory : null}
          parentId={parentIdForSubcategory}
          categories={categories}
          onSave={handleSave}
          isCreating={createCategoryMutation.isPending}
          isUpdating={updateCategoryMutation.isPending}
        />
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              {hasChildren
                ? `This category has ${categoryToDelete!.children.length} subcategories. Deleting it will remove all of them.`
                : `Are you sure you want to delete "${categoryToDelete?.name}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteCategoryMutation.isPending}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
              {deleteCategoryMutation.isPending && <Spinner />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
