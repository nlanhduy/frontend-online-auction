/* eslint-disable @typescript-eslint/no-unused-vars */
import { CalendarIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { QUERY_KEYS } from '@/constants/queryKey'
import { formatDate, formatToYYYYMMDD, handleApiError } from '@/lib/utils'
import { createUserSchema } from '@/lib/validation/auth'
import { AuthAPI } from '@/services/api/auth.api'
import { UserRole } from '@/types/auth.types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { CreateUserFormData } from '@/lib/validation/auth'

export const AdminCreateUser = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: undefined,
      address: '',
      dateOfBirth: '',
    },
  })

  const createUserMutation = useMutation({
    mutationFn: async (data: CreateUserFormData) => {
      const { confirmPassword, ...payload } = data
      const res = await AuthAPI.createUser({
        options: {
          data: payload,
        },
      })
      return res.data
    },
    onSuccess: () => {
      toast.success('User created successfully!')
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.user.all],
        exact: false,
      })
      navigate('/admin/users')
    },
    onError: err => {
      handleApiError(err, 'Failed to create user')
    },
  })

  function onSubmit(data: CreateUserFormData) {
    createUserMutation.mutate(data)
  }

  return (
    <div className='py-12'>
      <div className='container mx-auto max-w-3xl'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold'>Create New User</h1>
          <p className='text-gray-600 mt-2'>Add a new user to the system</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Enter the details for the new user account</CardDescription>
          </CardHeader>

          <CardContent>
            <form id='create-user-form' onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                {/* Full Name */}
                <Controller
                  name='fullName'
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor='fullName'>Full Name</FieldLabel>
                      <Input
                        {...field}
                        id='fullName'
                        type='text'
                        placeholder='John Doe'
                        autoComplete='name'
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
                      <FieldLabel htmlFor='email'>Email</FieldLabel>
                      <Input
                        {...field}
                        id='email'
                        type='email'
                        placeholder='john.doe@example.com'
                        autoComplete='email'
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                {/* User Role */}
                <Controller
                  name='role'
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor='role'>User Role</FieldLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id='role'>
                          <SelectValue placeholder='Select a role' />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(UserRole).map(role => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldDescription>
                        Assign a role to determine user permissions
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
                      selectedDate ? formatDate(selectedDate) : '',
                    )
                    const [month, setMonth] = useState<Date | undefined>(selectedDate)
                    const [datePickerOpen, setDatePickerOpen] = useState(false)

                    useEffect(() => {
                      if (field.value) {
                        const date = new Date(field.value)
                        setDisplayValue(formatDate(date))
                        setMonth(date)
                      } else {
                        setDisplayValue('')
                        setMonth(undefined)
                      }
                    }, [field.value])

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

                              const [y, m, d] = inputValue.split('-').map(Number)
                              if (y && m && d) {
                                const date = new Date(y, m - 1, d)
                                if (!isNaN(date.getTime())) {
                                  setMonth(date)
                                  field.onChange(inputValue) // store as YYYY-MM-DD
                                }
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
                                    setMonth(date)
                                    const yyyyMMdd = formatToYYYYMMDD(date)
                                    field.onChange(yyyyMMdd)
                                    setDisplayValue(formatDate(date))
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
                      <FieldLabel htmlFor='address'>Address</FieldLabel>
                      <Textarea
                        {...field}
                        id='address'
                        placeholder='123 Main St, City, Country'
                        rows={3}
                        className='resize-none'
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
                      <FieldLabel htmlFor='password'>Password</FieldLabel>
                      <Input
                        {...field}
                        id='password'
                        type='password'
                        placeholder='••••••••'
                        autoComplete='new-password'
                      />
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
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor='confirmPassword'>Confirm Password</FieldLabel>
                      <Input
                        {...field}
                        id='confirmPassword'
                        type='password'
                        placeholder='••••••••'
                        autoComplete='new-password'
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </FieldGroup>

              {/* Actions */}
              <div className='flex gap-3 mt-6'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => navigate('/admin/users')}
                  className='flex-1'>
                  Cancel
                </Button>
                <Button
                  type='submit'
                  className='flex-1'
                  disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? (
                    <>
                      <Spinner />
                      Creating...
                    </>
                  ) : (
                    'Create User'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
