/* eslint-disable @typescript-eslint/no-unused-vars */
import { ArrowLeft, CalendarIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

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
import { formatDate, handleApiError } from '@/lib/utils'
import { editUserSchema } from '@/lib/validation/auth'
import { AuthAPI } from '@/services/api/auth.api'
import { UserRole } from '@/types/auth.types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { EditUserFormData } from '@/lib/validation/auth'

export const AdminEditUser = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const userDetailQuery = useQuery({
    queryKey: [QUERY_KEYS.user.detail(id!)],
    queryFn: async () => {
      const response = await AuthAPI.getUserById({ variables: { userId: id } })
      return response.data
    },
    enabled: !!id,
  })

  const user = userDetailQuery.data

  const form = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    values: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      role: (user?.role as UserRole) || UserRole.Bidder,
      address: user?.address || '',
      dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
      password: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    if (user?.role) {
      form.setValue('role', user.role as UserRole)
    }
  }, [user?.role, form])

  const updateUserMutation = useMutation({
    mutationFn: async (data: EditUserFormData) => {
      const { confirmPassword, password, ...payload } = data

      // Only include password if it's provided
      const updateData =
        password && password.length > 0 ? { ...payload, password } : payload

      const res = await AuthAPI.updateUser({
        variables: { userId: id },
        options: {
          data: updateData,
        },
      })
      return res.data
    },
    onSuccess: () => {
      toast.success('User updated successfully!')
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.user.all],
        exact: false,
      })
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.user.detail(id!)],
      })
      navigate(`/admin/users/${id}`)
    },
    onError: err => {
      handleApiError(err, 'Failed to update user')
    },
  })

  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName || '',
        email: user.email || '',
        role: user.role || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        password: '',
        confirmPassword: '',
      })
    }
  }, [user])

  function onSubmit(data: EditUserFormData) {
    updateUserMutation.mutate(data)
  }

  if (userDetailQuery.isLoading) {
    return (
      <div className='py-12'>
        <div className='container mx-auto pt-10'>
          <div className='text-center py-12'>
            <Button disabled size='lg'>
              <Spinner />
              Loading user details...
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (userDetailQuery.isError || !user) {
    return (
      <div className='py-12'>
        <div className='container mx-auto pt-10'>
          <div className='text-center py-12'>
            <p className='text-lg text-red-600 mb-4'>
              An error occurred while loading data
            </p>
            <Button onClick={() => navigate('/admin/users')}>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back to Users
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='py-12'>
      <div className='container mx-auto max-w-3xl'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold'>Edit User</h1>
          <p className='text-gray-600 mt-2'>Update user information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Modify the user account details below</CardDescription>
          </CardHeader>

          <CardContent>
            <form id='edit-user-form' onSubmit={form.handleSubmit(onSubmit)}>
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
                      <Select
                        key={user?.role || 'role-key'}
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}>
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
                        Change the user&apos;s role and permissions
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
                    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
                      field.value ? new Date(field.value) : undefined,
                    )
                    const [displayValue, setDisplayValue] = useState(
                      selectedDate ? formatDate(selectedDate) : '',
                    )
                    const [month, setMonth] = useState<Date | undefined>(selectedDate)
                    const [datePickerOpen, setDatePickerOpen] = useState(false)

                    // Sync UI if field value changes (important for edit)
                    useEffect(() => {
                      if (field.value) {
                        const newDate = new Date(field.value)
                        setSelectedDate(newDate)
                        setDisplayValue(formatDate(newDate))
                        setMonth(newDate)
                      } else {
                        setSelectedDate(undefined)
                        setDisplayValue('')
                        setMonth(undefined)
                      }
                    }, [field.value])

                    // Helper: convert Date to YYYY-MM-DD
                    const formatToYYYYMMDD = (date: Date) => {
                      const y = date.getFullYear()
                      const m = String(date.getMonth() + 1).padStart(2, '0')
                      const d = String(date.getDate()).padStart(2, '0')
                      return `${y}-${m}-${d}`
                    }

                    return (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor='dateOfBirth'>
                          Date of Birth (Optional)
                        </FieldLabel>
                        <div className='relative flex gap-2'>
                          <Input
                            id='dateOfBirth'
                            value={displayValue}
                            placeholder='June 01, 1990'
                            className='bg-background pr-10'
                            onChange={e => {
                              const inputValue = e.target.value
                              setDisplayValue(inputValue)

                              const date = new Date(inputValue)
                              if (!isNaN(date.getTime())) {
                                setSelectedDate(date)
                                setMonth(date)
                                field.onChange(formatToYYYYMMDD(date)) // store YYYY-MM-DD
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
                                    setSelectedDate(date)
                                    setMonth(date)
                                    setDisplayValue(formatDate(date))
                                    field.onChange(formatToYYYYMMDD(date)) // store YYYY-MM-DD
                                  }
                                  setDatePickerOpen(false)
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
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
                      <FieldLabel htmlFor='address'>Address (Optional)</FieldLabel>
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

                {/* Password (Optional) */}
                <Controller
                  name='password'
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor='password'>New Password (Optional)</FieldLabel>
                      <Input
                        {...field}
                        id='password'
                        type='password'
                        placeholder='••••••••'
                        autoComplete='new-password'
                      />
                      <FieldDescription>
                        Leave blank to keep the current password
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
                      <FieldLabel htmlFor='confirmPassword'>
                        Confirm New Password
                      </FieldLabel>
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
                  onClick={() => navigate(`/admin/users/${id}`)}
                  className='flex-1'>
                  Cancel
                </Button>
                <Button
                  type='submit'
                  className='flex-1'
                  disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? (
                    <>
                      <Spinner />
                      Updating...
                    </>
                  ) : (
                    'Update User'
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
