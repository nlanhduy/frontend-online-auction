import { ImagePlus, Loader2, X } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { uploadImageToCloudinary } from '@/lib/utils';

// Main Image Upload Component
export function MainImageUpload({
  imageUrl,
  onImageChange,
  isUploading,
  setIsUploading,
  error,
}: {
  imageUrl: string
  onImageChange: (url: string) => void
  isUploading: boolean
  setIsUploading: (value: boolean) => void
  error?: string
}) {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const url = await uploadImageToCloudinary(file)
      onImageChange(url.secure_url)
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('Failed to upload image')
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const removeImage = () => {
    onImageChange('')
  }

  return (
    <div className='space-y-4'>
      {imageUrl ? (
        <div className='relative w-full group border rounded-lg overflow-hidden'>
          <img
            src={imageUrl}
            alt='Main product'
            className='
      w-full
      h-auto
      max-h-[500px]
      object-contain
      mx-auto
    '
          />

          <Button
            type='button'
            variant='destructive'
            size='icon'
            className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'
            onClick={removeImage}>
            <X className='h-4 w-4' />
          </Button>
        </div>
      ) : (
        <label htmlFor='main-image-upload'>
          <div className='flex items-center justify-center w-full aspect-15/5 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors'>
            {isUploading ? (
              <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
            ) : (
              <div className='flex flex-col items-center gap-2'>
                <ImagePlus className='h-8 w-8 text-muted-foreground' />
                <span className='text-sm text-muted-foreground'>
                  Click to upload main image
                </span>
              </div>
            )}
          </div>
          <input
            id='main-image-upload'
            type='file'
            accept='image/*'
            className='hidden'
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      )}
      {error && <p className='text-sm text-destructive mt-2'>{error}</p>}
    </div>
  )
}

// Image Upload Component
export function ImageUploadSection({
  images,
  onImagesChange,
  isUploading,
  setIsUploading,
  error,
}: {
  images: string[]
  onImagesChange: (images: string[]) => void
  isUploading: boolean
  setIsUploading: (value: boolean) => void
  error?: string
}) {
  const [uploadProgress, setUploadProgress] = useState<Record<string, boolean>>({})

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setIsUploading(true)

    const uploadedUrls: string[] = []

    for (const file of files) {
      const tempId = `${file.name}-${Date.now()}`
      setUploadProgress(prev => ({ ...prev, [tempId]: true }))

      try {
        const url = await uploadImageToCloudinary(file)
        uploadedUrls.push(url.secure_url)
      } catch (error) {
        console.error('Upload failed:', error)
      } finally {
        setUploadProgress(prev => {
          const newProgress = { ...prev }
          delete newProgress[tempId]
          return newProgress
        })
      }
    }

    onImagesChange([...images, ...uploadedUrls])
    setIsUploading(false)
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-3 gap-4'>
        {images.map((url, index) => (
          <div key={index} className='relative aspect-square group'>
            <img
              src={url}
              alt={`Product ${index + 1}`}
              className='w-full h-full object-cover rounded-lg border'
            />
            <Button
              type='button'
              variant='destructive'
              size='icon'
              className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'
              onClick={() => removeImage(index)}>
              <X className='h-4 w-4' />
            </Button>
          </div>
        ))}

        {Object.keys(uploadProgress).map(id => (
          <div
            key={id}
            className='relative aspect-square flex items-center justify-center border-2 border-dashed rounded-lg bg-muted'>
            <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
          </div>
        ))}
      </div>

      <div>
        <label htmlFor='image-upload'>
          <div className='flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors'>
            <div className='flex flex-col items-center gap-2'>
              <ImagePlus className='h-8 w-8 text-muted-foreground' />
              <span className='text-sm text-muted-foreground'>
                Click to upload images
              </span>
            </div>
          </div>
          <input
            id='image-upload'
            type='file'
            accept='image/*'
            multiple
            className='hidden'
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
        {error && <p className='text-sm text-destructive mt-2'>{error}</p>}
      </div>
    </div>
  )
}
