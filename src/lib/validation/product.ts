import * as z from 'zod';

export const productSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Product name is required')
      .min(2, 'Product name must be at least 2 characters')
      .max(100, 'Product name must not exceed 100 characters')
      .trim()
      .refine(val => val.length > 0, {
        message: 'Product name cannot be only whitespace',
      }),
    description: z
      .string()
      .min(1, 'Product description is required')
      .min(2, 'Product description must be at least 2 characters')
      .max(1000, 'Product description must not exceed 1000 characters')
      .trim()
      .refine(val => val.length > 0, {
        message: 'Product description cannot be only whitespace',
      }),
    mainImage: z.string().url('Invalid main image URL'),
    images: z
      .array(z.string().url('Invalid image URL'))
      .min(3, 'At least 3 images are required'),
    initialPrice: z
      .number()
      .min(1, 'Initial price is required')
      .positive('Initial price must be a positive number'),
    priceStep: z
      .number()
      .min(1, 'Price step is required')
      .positive('Price step must be a positive number'),
    buyNowPrice: z
      .number()
      .min(1, 'Buy now price is required')
      .positive('Buy now price must be a positive number'),
    startTime: z.string().datetime({ message: 'Invalid start time format' }),
    endTime: z.string().datetime({ message: 'Invalid end time format' }),
    categoryId: z.string('Invalid category ID'),
    autoExtend: z.boolean(),
  })
  .refine(
    data => {
      // buyNowPrice must be greater than initialPrice
      return data.buyNowPrice > data.initialPrice
    },
    {
      message: 'Buy now price must be greater than initial price',
      path: ['buyNowPrice'],
    },
  )
  .refine(
    data => {
      // priceStep should be reasonable (not greater than initialPrice)
      return data.priceStep <= data.initialPrice
    },
    {
      message: 'Price step cannot be greater than initial price',
      path: ['priceStep'],
    },
  )
  .refine(
    data => {
      // endTime must be after startTime
      const start = new Date(data.startTime)
      const end = new Date(data.endTime)
      return end > start
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    },
  )
  .refine(
    data => {
      // startTime must be in the future
      const start = new Date(data.startTime)
      const now = new Date()
      return start > now
    },
    {
      message: 'Start time must be in the future',
      path: ['startTime'],
    },
  )

export type ProductFormData = z.infer<typeof productSchema>
