import * as z from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  // .min(8, 'Password must be at least 8 characters'),
})

export const registerRequestSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Full name is required')
      .min(2, 'Full name must be at least 2 characters')
      .max(50, 'Full name must not exceed 50 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    address: z
      .string()
      .min(1, 'Address is required')
      .min(10, 'Address must be at least 10 characters')
      .max(200, 'Address must not exceed 200 characters'),
    dateOfBirth: z
      .string()
      .optional()
      .refine(
        val => {
          if (!val) return true // optional field
          const date = new Date(val)
          const isValid = !isNaN(date.getTime())
          if (!isValid) return false

          // Check if date is not in the future
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          return date <= today
        },
        { message: 'Please enter a valid date (not in the future)' },
      )
      .refine(
        val => {
          if (!val) return true // optional field
          const date = new Date(val)
          const age =
            (new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
          return age >= 13
        },
        { message: 'You must be at least 13 years old' },
      ),
    recaptchaToken: z.string().min(1, 'Please complete the reCAPTCHA verification'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export const registerVerifySchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  otp: z
    .string()
    .min(6, 'OTP must be 6 digits')
    .max(6, 'OTP must be 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
})

export const otpSchema = z.object({
  otp: z
    .string()
    .min(6, 'OTP must be 6 digits')
    .max(6, 'OTP must be 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
})

export const changeEmailRequestSchema = z.object({
  newEmail: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
})

export const changeEmailVerifySchema = z.object({
  newEmail: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  otp: z
    .string()
    .min(6, 'OTP must be 6 digits')
    .max(6, 'OTP must be 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
})

export const requestForgetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
})

export const verifyForgetPassword = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    otp: z
      .string()
      .min(6, 'OTP must be 6 digits')
      .max(6, 'OTP must be 6 digits')
      .regex(/^\d+$/, 'OTP must contain only numbers'),
    newPassword: z
      .string()
      .min(1, 'New password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      ),

    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterRequestFormData = z.infer<typeof registerRequestSchema>
export type RegisterVerifyFormData = z.infer<typeof registerVerifySchema>
export type OTPFormData = z.infer<typeof otpSchema>
export type ChangeEmailRequestFormData = z.infer<typeof changeEmailRequestSchema>
export type ChangeEmailVerifyFormData = z.infer<typeof changeEmailVerifySchema>
export type RequestForgetPasswordFormData = z.infer<typeof requestForgetPasswordSchema>
export type VerifyForgetPasswordFormData = z.infer<typeof verifyForgetPassword>
