import { Loader2 } from 'lucide-react'
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import RichTextEditor from '@/components/ui/ckeditor'
import { ImageUploadSection, MainImageUpload } from '@/components/ui/image-upload'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { QUERY_KEYS } from '@/constants/queryKey'
import { formatNumber, parseNumber } from '@/lib/utils'
import { productSchema } from '@/lib/validation/product'
import { CategoryAPI } from '@/services/api/category.api'
import { ProductAPI } from '@/services/api/product.api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { ProductFormData } from '@/lib/validation/product'
import type { Category } from '@/types/category.type'
// Form Field Component
function FormFieldWrapper({
  label,
  error,
  children,
  description,
}: {
  label: string
  error?: string
  children: React.ReactNode
  description?: string
}) {
  return (
    <div className='flex flex-col space-y-2'>
      <label className='text-sm font-medium'>{label}</label>
      {description && <p className='text-sm text-muted-foreground'>{description}</p>}
      {children}
      {error && <p className='text-sm text-destructive mt-1'>{error}</p>}
    </div>
  )
}

// Main Component
export default function CreateProductPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [isMainImageUploading, setIsMainImageUploading] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      images: [],
      initialPrice: undefined,
      priceStep: undefined,
      buyNowPrice: undefined,
      startTime: '',
      endTime: '',
      categoryId: undefined,
      autoExtend: false,
    },
  })

  const createProductMutation = useMutation({
    mutationFn: (data: ProductFormData) =>
      ProductAPI.createProduct({ options: { data } }),
    onSuccess: () => {
      toast.success('Product created successfully!')
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.user.myProducts] })
      navigate('/seller/products')
    },
  })

  function onSubmit(data: ProductFormData) {
    createProductMutation.mutate(data)
  }

  const { data: categoryData } = useQuery({
    queryKey: QUERY_KEYS.categories.all,
    queryFn: () => CategoryAPI.getAllCategories({}),
    staleTime: Infinity,
  })

  return (
    <div className='container max-w-4xl mx-auto py-8 px-4'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>Create New Auction Product</h1>
        <p className='text-muted-foreground mt-2'>Add a new product to your auction</p>
      </div>

      <div className='space-y-6'>
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter the basic details of your product</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Controller
              name='name'
              control={control}
              render={({ field }) => (
                <FormFieldWrapper label='Product Name' error={errors.name?.message}>
                  <Input placeholder='Enter product name' {...field} />
                </FormFieldWrapper>
              )}
            />
            <Controller
              name='categoryId'
              control={control}
              render={({ field }) => (
                <FormFieldWrapper label='Category' error={errors.categoryId?.message}>
                  <Select value={field?.value} onValueChange={field.onChange}>
                    <SelectTrigger className='h-12 !w-full'>
                      <SelectValue placeholder='Select a category' />
                    </SelectTrigger>

                    <SelectContent>
                      {categoryData?.data
                        .filter((category: Category) => category.children?.length > 0)
                        .map((category: Category) => (
                          <div key={category.id}>
                            {/* Parent */}
                            <SelectItem value={category.id} className='font-semibold'>
                              {category.name}
                            </SelectItem>

                            {/* Children */}
                            {category.children.map((child: Category) => (
                              <SelectItem
                                key={child.id}
                                value={child.id}
                                className='pl-6 text-muted-foreground'>
                                └ {child.name}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                    </SelectContent>
                  </Select>
                </FormFieldWrapper>
              )}
            />

            <Controller
              name='description'
              control={control}
              render={({ field }) => (
                <FormFieldWrapper label='Description' error={errors.description?.message}>
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder='Enter detailed product description...'
                  />
                </FormFieldWrapper>
              )}
            />
          </CardContent>
        </Card>

        {/* Auction Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Auction Pricing</CardTitle>
            <CardDescription>
              Set your auction prices and bidding increments
            </CardDescription>
          </CardHeader>

          <CardContent className='space-y-4'>
            <div className='grid grid-cols-3 gap-4'>
              {/* Initial Price */}
              <Controller
                name='initialPrice'
                control={control}
                render={({ field }) => (
                  <FormFieldWrapper
                    label='Initial Price ($)'
                    error={errors.initialPrice?.message}>
                    <Input
                      type='text'
                      inputMode='decimal'
                      placeholder='0'
                      value={formatNumber(field.value)}
                      onChange={e => {
                        field.onChange(parseNumber(e.target.value))
                      }}
                    />
                  </FormFieldWrapper>
                )}
              />

              {/* Price Step */}
              <Controller
                name='priceStep'
                control={control}
                render={({ field }) => (
                  <FormFieldWrapper
                    label='Price Step ($)'
                    error={errors.priceStep?.message}>
                    <Input
                      type='text'
                      inputMode='decimal'
                      placeholder='0'
                      value={formatNumber(field.value)}
                      onChange={e => {
                        field.onChange(parseNumber(e.target.value))
                      }}
                    />
                  </FormFieldWrapper>
                )}
              />

              {/* Buy Now Price */}
              <Controller
                name='buyNowPrice'
                control={control}
                render={({ field }) => (
                  <FormFieldWrapper
                    label='Buy Now Price ($)'
                    error={errors.buyNowPrice?.message}>
                    <Input
                      type='text'
                      inputMode='decimal'
                      placeholder='0'
                      value={formatNumber(field.value)}
                      onChange={e => {
                        field.onChange(parseNumber(e.target.value))
                      }}
                    />
                  </FormFieldWrapper>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Product Images */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
            <CardDescription>
              Upload a main image and at least 3 additional images
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Main Image */}
            <div>
              <h3 className='text-sm font-medium mb-3'>Main Image</h3>
              <Controller
                control={control}
                name='mainImage'
                render={({ field }) => (
                  <MainImageUpload
                    imageUrl={field.value || ''}
                    onImageChange={field.onChange}
                    isUploading={isMainImageUploading}
                    setIsUploading={setIsMainImageUploading}
                    error={errors.mainImage?.message}
                  />
                )}
              />
            </div>

            {/* Additional Images */}
            <div>
              <h3 className='text-sm font-medium mb-3'>Additional Images</h3>
              <Controller
                control={control}
                name='images'
                render={({ field }) => (
                  <ImageUploadSection
                    images={field.value || []}
                    onImagesChange={field.onChange}
                    isUploading={isUploading}
                    setIsUploading={setIsUploading}
                    error={errors.images?.message}
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Auction Timing */}
        <Card>
          <CardHeader>
            <CardTitle>Auction Timing</CardTitle>
            <CardDescription>Set the start and end time for your auction</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <Controller
                name='startTime'
                control={control}
                render={({ field }) => (
                  <FormFieldWrapper label='Start Time' error={errors.startTime?.message}>
                    <Input
                      type='datetime-local'
                      {...field}
                      onChange={e => {
                        const date = new Date(e.target.value)
                        field.onChange(date.toISOString())
                      }}
                      value={
                        field.value
                          ? new Date(field.value).toISOString().slice(0, 16)
                          : ''
                      }
                    />
                  </FormFieldWrapper>
                )}
              />

              <Controller
                name='endTime'
                control={control}
                render={({ field }) => (
                  <FormFieldWrapper label='End Time' error={errors.endTime?.message}>
                    <Input
                      type='datetime-local'
                      {...field}
                      onChange={e => {
                        const date = new Date(e.target.value)
                        field.onChange(date.toISOString())
                      }}
                      value={
                        field.value
                          ? new Date(field.value).toISOString().slice(0, 16)
                          : ''
                      }
                    />
                  </FormFieldWrapper>
                )}
              />
            </div>

            <Controller
              name='autoExtend'
              control={control}
              render={({ field }) => (
                <div className='flex items-center justify-between pt-4 border-t'>
                  <div>
                    <label className='text-sm font-medium'>Auto-Extend Auction</label>
                    <p className='text-sm text-muted-foreground'>
                      Automatically extend the auction if bids are placed near the end
                      time
                    </p>
                  </div>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </div>
              )}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className='flex justify-end gap-4'>
          <Button type='button' variant='outline' onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={
              isUploading || isMainImageUploading || createProductMutation.isPending
            }>
            {createProductMutation.isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Creating Product...
              </>
            ) : (
              'Create Product'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
