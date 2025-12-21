import { Loader2 } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

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
import { useLogin } from '@/hooks/use-auth'
import { loginSchema } from '@/lib/validation/auth'
import { zodResolver } from '@hookform/resolvers/zod'

import type { LoginFormData } from '@/lib/validation/auth'
export function LoginForm() {
  const { mutate: login, isPending } = useLogin()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  function onSubmit(data: LoginFormData) {
    login(data)
  }

  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle className='text-2xl'>Login</CardTitle>
        <CardDescription>
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form id='login-form' onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Email Field */}
            <Controller
              name='email'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='login-email'>Email</FieldLabel>
                  <Input
                    {...field}
                    id='login-email'
                    type='email'
                    placeholder='john.doe@example.com'
                    autoComplete='email'
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Password Field */}
            <Controller
              name='password'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='login-password'>Password</FieldLabel>
                  <div className='relative'>
                    <Input
                      {...field}
                      id='login-password'
                      type={'password'}
                      placeholder='••••••••'
                      autoComplete='current-password'
                      aria-invalid={fieldState.invalid}
                    />
                  </div>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className='flex flex-col gap-4'>
        <Button type='submit' form='login-form' className='w-full' disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Logging in...
            </>
          ) : (
            'Login'
          )}
        </Button>

        {/* Register AND Forgot Password */}
        <div className='flex items-center justify-between'>
          <Link
            to='/forgot-password'
            className='text-sm text-muted-foreground hover:underline'>
            Forgot password?
          </Link>
        </div>
        <div className='text-sm text-center text-muted-foreground'>
          Don&apos;t have an account?{' '}
          <Link to='/register' className='font-medium text-primary hover:underline'>
            Register now
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
