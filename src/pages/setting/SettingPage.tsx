/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { OTPVerificationModal } from '@/components/auth/OTPVerificationModal'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
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
import { Spinner } from '@/components/ui/spinner'
import { QUERY_KEYS } from '@/constants/queryKey'
import { useAuth } from '@/hooks/use-auth'
import { handleApiError } from '@/lib/utils'
import {
  changeEmailSchema,
  changeFullNameSchema,
  changePasswordSchema,
} from '@/lib/validation/setting'
import { AuthAPI } from '@/services/api/auth.api'
import { ProductAPI } from '@/services/api/product.api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'

import type {
  ChangeEmailFormData,
  ChangeFullNameFormData,
  ChangePasswordFormData,
} from '@/lib/validation/setting'
export function SettingsPage() {
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [pendingEmail, setPendingEmail] = useState('')

  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const userDataQuery = useQuery({
    queryKey: QUERY_KEYS.auth.me,
    queryFn: async () => {
      const response = await AuthAPI.getMe({})
      return response.data
    },
    enabled: !!isAuthenticated,
    staleTime: 1000 * 60 * 5,
  })
  const userInformation = userDataQuery.data

  // Email Form
  const emailForm = useForm<ChangeEmailFormData>({
    resolver: zodResolver(changeEmailSchema),
    values: {
      newEmail: userInformation?.email || '',
    },
  })

  // Full Name Form
  const nameForm = useForm<ChangeFullNameFormData>({
    resolver: zodResolver(changeFullNameSchema),
    values: {
      fullName: userInformation?.fullName || '',
    },
  })

  // Password Form
  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const changeNameMutation = useMutation({
    mutationFn: async ({ fullName }: { fullName: string }) => {
      const response = await AuthAPI.changeName({
        options: {
          data: {
            fullName,
          },
        },
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('Update name successfully')
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.auth.me,
      })
    },
    onError: err => {
      handleApiError(err)
    },
  })

  const requestChangeMailMutation = useMutation({
    mutationFn: async ({ newEmail }: { newEmail: string }) => {
      const response = await AuthAPI.requestChangeMail({
        options: {
          data: {
            newEmail,
          },
        },
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('An OTP code has just sent to your mail. Please check')
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.auth.me,
      })
      setShowOTPModal(true)
    },
    onError: err => {
      handleApiError(err)
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: async ({
      oldPassword,
      newPassword,
    }: {
      oldPassword: string
      newPassword: string
    }) => {
      const response = await AuthAPI.changePassword({
        options: {
          data: {
            oldPassword,
            newPassword,
          },
        },
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('Your password updated successfully')
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.auth.me,
      })
    },
    onError: err => {
      handleApiError(err)
    },
  })

  const verifyChangeMailMutation = useMutation({
    mutationFn: async ({ newEmail, otp }: { newEmail: string; otp: number }) => {
      const response = await AuthAPI.verifyChangeMail({
        options: {
          data: {
            newEmail,
            otp,
          },
        },
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('Change email successfully')
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.auth.me,
      })
    },
    onError: err => {
      handleApiError(err)
    },
  })

  function onEmailSubmit(data: ChangeEmailFormData) {
    setPendingEmail(data.newEmail)
    requestChangeMailMutation.mutate(data)
  }

  function onNameSubmit(data: ChangeFullNameFormData) {
    changeNameMutation.mutate(data)
  }

  function onPasswordSubmit(data: ChangePasswordFormData) {
    changePasswordMutation.mutate(data, {
      onSuccess: () => {
        passwordForm.reset()
      },
    })
  }

  function handleOTPVerify(otp: number) {
    verifyChangeMailMutation.mutate(
      {
        newEmail: emailForm.getValues('newEmail'),
        otp: otp,
      },
      {
        onSuccess: () => {
          setPendingEmail('')
        },
      },
    )
  }

  return (
    <div className='min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-2xl mx-auto space-y-6'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Settings</h1>
          <p className='text-muted-foreground mt-2'>
            Manage your account information and security
          </p>
        </div>

        {/* Change Full Name */}
        <Card>
          <CardHeader>
            <CardTitle>Change Full Name</CardTitle>
            <CardDescription>
              Update your full name associated with your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={nameForm.handleSubmit(onNameSubmit)}>
              <FieldGroup>
                <Controller
                  name='fullName'
                  control={nameForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor='fullName'>Full Name</FieldLabel>
                      <Input
                        {...field}
                        id='fullName'
                        type='text'
                        placeholder='John Doe'
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </FieldGroup>
              <Button
                type='submit'
                className='mt-4'
                disabled={changeNameMutation.isPending}>
                {changeNameMutation.isPending ? (
                  <>
                    <Spinner />
                    Updating...
                  </>
                ) : (
                  'Update Name'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Email */}
        <Card>
          <CardHeader>
            <CardTitle>Change Email</CardTitle>
            <CardDescription>
              Update your email address. An OTP will be sent to verify your new email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
              <FieldGroup>
                <Controller
                  name='newEmail'
                  control={emailForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor='newEmail'>New Email</FieldLabel>
                      <Input
                        {...field}
                        id='newEmail'
                        type='email'
                        placeholder='newemail@example.com'
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldDescription>
                        We&apos;ll send you an OTP to verify this email address
                      </FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </FieldGroup>
              <Button
                type='submit'
                className='mt-4'
                disabled={requestChangeMailMutation.isPending}>
                {requestChangeMailMutation.isPending ? (
                  <>
                    <Spinner />
                    Sending OTP...
                  </>
                ) : (
                  'Change Email'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
              <FieldGroup>
                {/* Old Password */}
                <Controller
                  name='oldPassword'
                  control={passwordForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor='oldPassword'>Current Password</FieldLabel>
                      <div className='relative'>
                        <Input
                          {...field}
                          id='oldPassword'
                          type={'password'}
                          placeholder='••••••••'
                          aria-invalid={fieldState.invalid}
                        />
                      </div>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                {/* New Password */}
                <Controller
                  name='newPassword'
                  control={passwordForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor='newPassword'>New Password</FieldLabel>
                      <div className='relative'>
                        <Input
                          {...field}
                          id='newPassword'
                          type={'password'}
                          placeholder='••••••••'
                          aria-invalid={fieldState.invalid}
                        />
                      </div>
                      <FieldDescription>
                        Must be at least 8 characters with uppercase, lowercase, and
                        number
                      </FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                {/* Confirm Password */}
                <Controller
                  name='confirmPassword'
                  control={passwordForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor='confirmPassword'>
                        Confirm New Password
                      </FieldLabel>
                      <div className='relative'>
                        <Input
                          {...field}
                          id='confirmPassword'
                          type={'password'}
                          placeholder='••••••••'
                          aria-invalid={fieldState.invalid}
                        />
                      </div>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </FieldGroup>
              <Button
                type='submit'
                className='mt-4'
                disabled={changePasswordMutation.isPending}>
                {changePasswordMutation.isPending ? (
                  <>
                    <Spinner />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        open={showOTPModal}
        onOpenChange={setShowOTPModal}
        email={pendingEmail}
        onVerify={handleOTPVerify}
        isPending={false}
      />
    </div>
  )
}
