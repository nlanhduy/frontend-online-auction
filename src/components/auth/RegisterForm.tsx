import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { Controller, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useRegister } from '@/hooks/use-auth'
import { registerSchema } from '@/lib/validation/auth'
import { zodResolver } from '@hookform/resolvers/zod'

import { OTPVerificationModal } from './OTPVerificationModal'

import type { RegisterFormData } from '@/lib/validation/auth'
import type { SetStateAction } from 'react'
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY
export function RegisterForm() {
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  console.log(RECAPTCHA_SITE_KEY)

  const { mutate: register, isPending } = useRegister(email => {
    setUserEmail(email)
    setShowOTPModal(true)
  })

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      address: '',
    },
  })

  function onSubmit(data: RegisterFormData) {
    // Validate reCAPTCHA
    if (!recaptchaToken) {
      toast.error('Please complete the reCAPTCHA verification')
      return
    }

    register({
      ...data,
      recaptchaToken,
    })
  }

  return (
    <>
      <Card className='max-w-xl w-full'>
        <CardHeader>
          <CardTitle className='text-2xl mx-auto'>Create an Account</CardTitle>
          <CardDescription className='mx-auto'>
            Enter your information to register for AuctionHub
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form id='register-form' onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              {/* Full Name */}
              <Controller
                name='fullName'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='register-fullName'>Full Name</FieldLabel>
                    <Input
                      {...field}
                      id='register-fullName'
                      type='text'
                      placeholder='John Doe'
                      autoComplete='name'
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {/* Email */}
              <Controller
                name='email'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='register-email'>Email</FieldLabel>
                    <Input
                      {...field}
                      id='register-email'
                      type='email'
                      placeholder='john.doe@example.com'
                      autoComplete='email'
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>
                      We&apos;ll send you an OTP to verify your email
                    </FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {/* Address */}
              <Controller
                name='address'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='register-address'>Address</FieldLabel>
                    <Textarea
                      {...field}
                      id='register-address'
                      placeholder='123 Main St, City, Country'
                      rows={3}
                      className='resize-none'
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {/* Password */}
              <Controller
                name='password'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='register-password'>Password</FieldLabel>
                    <div className='relative'>
                      <Input
                        {...field}
                        id='register-password'
                        type='password'
                        placeholder='••••••••'
                        autoComplete='new-password'
                        aria-invalid={fieldState.invalid}
                      />
                    </div>
                    <FieldDescription>
                      Must be at least 8 characters with uppercase, lowercase, and number
                    </FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {/* Confirm Password */}
              <Controller
                name='confirmPassword'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='register-confirmPassword'>
                      Confirm Password
                    </FieldLabel>
                    <div className='relative'>
                      <Input
                        {...field}
                        id='register-confirmPassword'
                        type='password'
                        placeholder='••••••••'
                        autoComplete='new-password'
                        aria-invalid={fieldState.invalid}
                      />
                    </div>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {/* reCAPTCHA */}
              <Field className='flex w-full'>
                <ReCAPTCHA
                  sitekey={RECAPTCHA_SITE_KEY}
                  className='mx-auto'
                  onChange={(token: SetStateAction<string | null>) =>
                    setRecaptchaToken(token)
                  }
                  onExpired={() => setRecaptchaToken(null)}
                />
              </Field>
            </FieldGroup>
          </form>
        </CardContent>

        <CardFooter className='flex flex-col gap-4'>
          <Button
            type='submit'
            form='register-form'
            className='w-full'
            disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>

          <div className='text-sm text-center text-muted-foreground'>
            Already have an account?{' '}
            <Link to='/login' className='font-medium text-primary hover:underline'>
              Login here
            </Link>
          </div>
        </CardFooter>
      </Card>

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        open={showOTPModal}
        onOpenChange={setShowOTPModal}
        email={userEmail}
      />
    </>
  )
}
