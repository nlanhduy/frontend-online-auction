import { z } from 'zod'

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name must not exceed 100 characters')
    .trim()
    .refine(val => val.length > 0, {
      message: 'Category name cannot be only whitespace',
    }),

  description: z.string().optional().default(''),

  parentId: z.string().uuid('Invalid parent category ID').optional(),
})
export type CategoryFormInput = z.input<typeof categorySchema>
export type CategoryFormData = z.output<typeof categorySchema>
