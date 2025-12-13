'use client'

import { Loader2 } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { handleApiError } from '@/lib/utils'
import { otpSchema } from '@/lib/validation/setting'
import { zodResolver } from '@hookform/resolvers/zod'

import type { OTPFormData } from '@/lib/validation/setting'

interface OTPVerificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  email: string
  onVerify: (otp: number) => void
  isPending?: boolean
}

export function OTPVerificationModal({
  open,
  onOpenChange,
  email,
  onVerify,
  isPending = false,
}: OTPVerificationModalProps) {
  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  })

  async function onSubmit(data: OTPFormData) {
    try {
      const otpNumber = Number(data.otp)
      await onVerify(otpNumber)

      form.reset()
      onOpenChange(false)
      toast.success('Email verified successfully')
    } catch (error) {
      handleApiError(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-sm'>
        <DialogHeader>
          <DialogTitle>Verify Email</DialogTitle>
          <DialogDescription>
            We&apos;ve sent an OTP to <b>{email}</b>. Enter it below to confirm your email
            change.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <FieldGroup>
            <Controller
              name='otp'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>One-Time Password</FieldLabel>

                  {/* OTP CENTER + BIG */}
                  <div className='flex justify-center'>
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
                      className='gap-2'>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className='h-12 w-12 text-xl' />
                        <InputOTPSlot index={1} className='h-12 w-12 text-xl' />
                        <InputOTPSlot index={2} className='h-12 w-12 text-xl' />
                      </InputOTPGroup>

                      <InputOTPSeparator />

                      <InputOTPGroup>
                        <InputOTPSlot index={3} className='h-12 w-12 text-xl' />
                        <InputOTPSlot index={4} className='h-12 w-12 text-xl' />
                        <InputOTPSlot index={5} className='h-12 w-12 text-xl' />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <FieldDescription>
                    Enter the 6-digit code sent to your email
                  </FieldDescription>

                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>

          <Button type='submit' className='w-full' disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Verifying...
              </>
            ) : (
              'Verify Email'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
