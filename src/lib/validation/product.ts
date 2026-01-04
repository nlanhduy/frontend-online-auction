import * as z from 'zod'

const datetimeLocal = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Invalid datetime')
  .refine(v => !isNaN(new Date(v).getTime()), 'Invalid datetime')

export const productSchema = (minImages: number = 3) =>
  z
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
        .min(minImages, `At least ${minImages} images are required`),

      initialPrice: z.number().positive(),
      priceStep: z.number().positive(),
      buyNowPrice: z.number().positive(),

      startTime: datetimeLocal,
      endTime: datetimeLocal,

      categoryId: z.string(),
      autoExtend: z.boolean(),
      allowNewBidders: z.boolean(),
    })
    .refine(data => data.buyNowPrice > data.initialPrice, {
      path: ['buyNowPrice'],
      message: 'Buy now price must be greater than initial price',
    })
    .refine(data => data.priceStep <= data.initialPrice, {
      path: ['priceStep'],
      message: 'Price step cannot be greater than initial price',
    })
    .refine(data => new Date(data.endTime) > new Date(data.startTime), {
      path: ['endTime'],
      message: 'End time must be after start time',
    })
    .refine(
      data => {
        const start = new Date(data.startTime)
        const now = new Date()
        now.setSeconds(0, 0)

        return start > now
      },
      {
        path: ['startTime'],
        message: 'Start time must be in the future',
      },
    )
export type ProductFormData = z.infer<ReturnType<typeof productSchema>>
