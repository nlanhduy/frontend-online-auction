import { Loader2 } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { useResendOTP, useVerifyOTP } from '@/hooks/use-auth'
import { otpSchema } from '@/lib/validation/auth'
import { zodResolver } from '@hookform/resolvers/zod'

import type { OTPFormData } from '@/lib/validation/auth'
interface OTPVerificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  email: string
}

export function OTPVerificationModal({
  open,
  onOpenChange,
  email,
}: OTPVerificationModalProps) {
  const { mutate: verifyOTP, isPending: isVerifying } = useVerifyOTP(() => {
    onOpenChange(false)
  })

  const { mutate: resendOTP, isPending: isResending } = useResendOTP()

  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  })

  function onSubmit(data: OTPFormData) {
    verifyOTP({
      email,
      otp: data.otp,
    })
  }

  function handleResendOTP() {
    resendOTP({ email })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Verify Your Email</DialogTitle>
          <DialogDescription>
            We&apos;ve sent a 6-digit code to <strong>{email}</strong>
          </DialogDescription>
        </DialogHeader>

        <form id='otp-form' onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name='otp'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='space-y-4'>
                  <FieldLabel htmlFor='otp-input' className='sr-only'>
                    OTP Code
                  </FieldLabel>
                  <div className='flex justify-center'>
                    <InputOTP maxLength={6} value={field.value} onChange={field.onChange}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <FieldDescription className='text-center'>
                    Enter the 6-digit code sent to your email
                  </FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter className='flex-col gap-2 sm:flex-col'>
          <Button type='submit' form='otp-form' className='w-full' disabled={isVerifying}>
            {isVerifying ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Verifying...
              </>
            ) : (
              'Verify Email'
            )}
          </Button>

          <Button
            type='button'
            variant='ghost'
            className='w-full'
            onClick={handleResendOTP}
            disabled={isResending}>
            {isResending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Sending...
              </>
            ) : (
              "Didn't receive code? Resend"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
