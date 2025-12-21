/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { OTPVerificationModal } from '@/components/auth/OTPVerificationModal'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { handleApiError } from '@/lib/utils'
import { requestForgetPasswordSchema, verifyForgetPassword } from '@/lib/validation/auth'
import { AuthAPI } from '@/services/api/auth.api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'

import type {
  RequestForgetPasswordFormData,
  VerifyForgetPasswordFormData,
} from '@/lib/validation/auth'
function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [showOTPModal, setShowOTPModal] = useState(false)

  // Request form - only email
  const requestForm = useForm<RequestForgetPasswordFormData>({
    resolver: zodResolver(requestForgetPasswordSchema),
    defaultValues: { email: '' },
  })

  // Verify form - email, otp, passwords
  const verifyForm = useForm<VerifyForgetPasswordFormData>({
    resolver: zodResolver(verifyForgetPassword),
    defaultValues: {
      email: '',
      otp: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  // Request forgot password mutation
  const requestForgetPasswordMutation = useMutation({
    mutationFn: async (data: RequestForgetPasswordFormData) => {
      const response = await AuthAPI.requestForgetPassword({
        options: { data },
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('Verification code sent to your email')
      // Copy email to verify form
      verifyForm.setValue('email', requestForm.getValues('email'))
      setShowOTPModal(true)
    },
    onError: (error: any) => {
      handleApiError(error, 'Failed to request password reset')
    },
  })

  // Verify and reset password mutation
  const verifyForgetPasswordMutation = useMutation({
    mutationFn: async (data: VerifyForgetPasswordFormData) => {
      const { email, otp, newPassword } = data
      const response = await AuthAPI.verifyForgetPassword({
        options: { data: { email, otp, newPassword } },
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('Password reset successfully')
      setShowOTPModal(false)
      navigate('/login')
    },
    onError: (error: any) => {
      handleApiError(error, 'Failed to reset password')
    },
  })

  function onSubmitRequest(data: RequestForgetPasswordFormData) {
    // Validate password fields before sending request
    const passwordsValid = verifyForm.trigger(['newPassword', 'confirmPassword'])

    if (!passwordsValid) {
      toast.error('Please fill in all password fields correctly')
      return
    }

    requestForgetPasswordMutation.mutate(data)
  }

  function handleOTPVerify(otp: number) {
    const verifyData = verifyForm.getValues()

    verifyForgetPasswordMutation.mutate({
      email: verifyData.email,
      otp: String(otp),
      newPassword: verifyData.newPassword,
      confirmPassword: verifyData.confirmPassword,
    })
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-muted/40 p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle className='text-2xl'>Forgot Password</CardTitle>
          <CardDescription>
            Enter your email and new password, then verify with the code sent to your
            email
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            id='forgot-password-form'
            onSubmit={requestForm.handleSubmit(onSubmitRequest)}>
            <FieldGroup>
              {/* Email Field */}
              <Controller
                name='email'
                control={requestForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='forgot-password-email'>Email</FieldLabel>
                    <Input
                      {...field}
                      id='forgot-password-email'
                      type='email'
                      placeholder='john.doe@example.com'
                      autoComplete='email'
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {/* New Password Field */}
              <Controller
                name='newPassword'
                control={verifyForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='new-password'>New Password</FieldLabel>
                    <Input
                      {...field}
                      id='new-password'
                      type='password'
                      placeholder='••••••••'
                      autoComplete='new-password'
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {/* Confirm Password Field */}
              <Controller
                name='confirmPassword'
                control={verifyForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='confirm-password'>Confirm Password</FieldLabel>
                    <Input
                      {...field}
                      id='confirm-password'
                      type='password'
                      placeholder='••••••••'
                      autoComplete='new-password'
                      aria-invalid={fieldState.invalid}
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
            form='forgot-password-form'
            className='w-full'
            disabled={requestForgetPasswordMutation.isPending}>
            {requestForgetPasswordMutation.isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Sending code...
              </>
            ) : (
              'Send verification code'
            )}
          </Button>

          {/* Back to Login */}
          <div className='text-sm text-center text-muted-foreground'>
            Remember your password?{' '}
            <Link to='/login' className='font-medium text-primary hover:underline'>
              Back to login
            </Link>
          </div>
        </CardFooter>
      </Card>

      {/* OTP Verification Modal - Only for OTP input */}
      <OTPVerificationModal
        open={showOTPModal}
        onOpenChange={setShowOTPModal}
        email={verifyForm.getValues('email')}
        onVerify={handleOTPVerify}
        isPending={verifyForgetPasswordMutation.isPending}
      />
    </div>
  )
}

export default ForgotPasswordPage
