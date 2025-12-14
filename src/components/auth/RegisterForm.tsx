/* eslint-disable @typescript-eslint/no-unused-vars */
import { CalendarIcon, Loader2 } from 'lucide-react'
import { useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { Controller, useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { handleApiError } from '@/lib/utils'
import { registerRequestSchema } from '@/lib/validation/auth'
import { AuthAPI } from '@/services/api/auth.api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'

import { Spinner } from '../ui/spinner'
import { OTPVerificationModal } from './OTPVerificationModal'

import type { RegisterRequestFormData } from '@/lib/validation/auth'
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY

function formatDate(date: Date | undefined) {
  if (!date) {
    return ''
  }
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}

export function RegisterForm() {
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const navigate = useNavigate()

  const form = useForm<RegisterRequestFormData>({
    resolver: zodResolver(registerRequestSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      address: '',
      dateOfBirth: '',
    },
  })

  const requestRegisterMutation = useMutation({
    mutationFn: async (data: RegisterRequestFormData) => {
      const { confirmPassword, ...payload } = data

      const res = await AuthAPI.requestRegister({
        options: {
          data: payload,
        },
      })
      return res.data
    },
    onSuccess: () => {
      toast.success('An OTP code has just sent to your mail.')
      setShowOTPModal(true)
    },
    onError: err => {
      handleApiError(err)
    },
  })

  const verifyRegisterMuation = useMutation({
    mutationFn: async ({ email, otp }: { email: string; otp: number }) => {
      const res = await AuthAPI.verifyRegister({
        options: {
          data: {
            email,
            otp,
          },
        },
      })
      return res.data
    },
    onSuccess: () => {
      toast.success('Register successfully !')
      navigate('/login')
    },
    onError: err => {
      handleApiError(err)
    },
  })

  function onSubmit(data: RegisterRequestFormData) {
    requestRegisterMutation.mutate(data)
  }

  function handleOTPVerify(otp: number) {
    verifyRegisterMuation.mutate({
      email: form.getValues('email'),
      otp,
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

              {/* Date of Birth */}
              <Controller
                name='dateOfBirth'
                control={form.control}
                render={({ field, fieldState }) => {
                  const selectedDate = field.value ? new Date(field.value) : undefined
                  const [displayValue, setDisplayValue] = useState(
                    formatDate(selectedDate),
                  )
                  const [month, setMonth] = useState<Date | undefined>(selectedDate)

                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor='register-dateOfBirth'>
                        Date of Birth (Optional)
                      </FieldLabel>
                      <div className='relative flex gap-2'>
                        <Input
                          id='register-dateOfBirth'
                          value={displayValue}
                          placeholder='June 01, 1990'
                          className='bg-background pr-10'
                          onChange={e => {
                            const inputValue = e.target.value
                            setDisplayValue(inputValue)

                            const date = new Date(inputValue)
                            if (isValidDate(date)) {
                              field.onChange(date.toISOString().split('T')[0])
                              setMonth(date)
                            }
                          }}
                          onKeyDown={e => {
                            if (e.key === 'ArrowDown') {
                              e.preventDefault()
                              setDatePickerOpen(true)
                            }
                          }}
                        />
                        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              type='button'
                              variant='ghost'
                              className='absolute top-1/2 right-2 size-6 -translate-y-1/2'>
                              <CalendarIcon className='size-3.5' />
                              <span className='sr-only'>Select date</span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className='w-auto overflow-hidden p-0'
                            align='end'
                            alignOffset={-8}
                            sideOffset={10}>
                            <Calendar
                              mode='single'
                              selected={selectedDate}
                              captionLayout='dropdown'
                              month={month}
                              onMonthChange={setMonth}
                              fromYear={1900}
                              toYear={new Date().getFullYear()}
                              onSelect={date => {
                                if (date) {
                                  const formattedDate = date.toISOString().split('T')[0]
                                  field.onChange(formattedDate)
                                  setDisplayValue(formatDate(date))
                                  setMonth(date)
                                }
                                setDatePickerOpen(false)
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <FieldDescription>
                        Your date of birth helps us personalize your experience
                      </FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )
                }}
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
              <Controller
                name='recaptchaToken'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className='flex w-full flex-col'>
                    <ReCAPTCHA
                      sitekey={RECAPTCHA_SITE_KEY}
                      className='mx-auto'
                      onChange={token => field.onChange(token)}
                      onExpired={() => field.onChange('')}
                    />

                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>

        <CardFooter className='flex flex-col gap-4'>
          <Button
            type='submit'
            form='register-form'
            className='w-full'
            disabled={
              verifyRegisterMuation.isPending || requestRegisterMutation.isPending
            }>
            {verifyRegisterMuation.isPending || requestRegisterMutation.isPending ? (
              <>
                <Spinner />
                {requestRegisterMutation.isPending && 'Sending OTP ...'}
                {verifyRegisterMuation.isPending && 'Creating account...'}
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
        email={form.getValues('email')}
        onVerify={handleOTPVerify}
        isPending={false}
      />
    </>
  )
}
