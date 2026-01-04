/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SystemSetting } from '@/lib/validation/systemSetting'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QUERY_KEYS } from '@/constants/queryKey'
import { handleApiError } from '@/lib/utils'
import { SystemSettingAPI } from '@/services/api/systemSettingAPI'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const AdminSystemSetting = () => {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const queryClient = useQueryClient()
  const systemSettingQuery = useQuery({
    queryKey: QUERY_KEYS.admin.systemSettings,
    queryFn: async () => {
      const res = await SystemSettingAPI.getSystemSettings({ options: {} })
      return res.data
    },
    staleTime: Infinity,
  })

  const updateSystemSettingMutation = useMutation({
    mutationFn: (updatedSettings: SystemSetting) =>
      SystemSettingAPI.updateSystemSettings({
        options: {
          data: updatedSettings,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.admin.systemSettings,
      })
      setConfirmOpen(false)
      toast.success('System settings updated successfully')
    },
    onError: (error: any) => {
      handleApiError(error, 'Failed to update system settings')
    },
  })

  const form = useForm<SystemSetting>({
    values: {
      autoExtendThresholdMinutes:
        systemSettingQuery.data?.autoExtendThresholdMinutes || 0,
      extensionDuration: systemSettingQuery.data?.extensionDuration || 0,
      maxExtensions: systemSettingQuery.data?.maxExtensions || 0,
      minImages: systemSettingQuery.data?.minImages || 0,
    },
  })

  const onSubmit = (values: SystemSetting) => {
    updateSystemSettingMutation.mutate(values)
  }

  const values = form.getValues()
  if (systemSettingQuery.isLoading) {
    return (
      <div className='container mx-auto flex items-center justify-center min-h-screen'>
        <Button disabled size='lg'>
          Loading...
        </Button>
      </div>
    )
  }
  return (
    <Card className='max-w-xl container mx-auto mt-8 py-12 my-12'>
      <CardHeader>
        <CardTitle>System Settings</CardTitle>
      </CardHeader>

      <CardContent className='space-y-4'>
        <div className='space-y-1'>
          <Label>Auto Extend Threshold (minutes)</Label>
          <Input
            type='number'
            {...form.register('autoExtendThresholdMinutes', { valueAsNumber: true })}
          />
        </div>

        <div className='space-y-1'>
          <Label>Extension Duration (minutes)</Label>
          <Input
            type='number'
            {...form.register('extensionDuration', { valueAsNumber: true })}
          />
        </div>

        <div className='space-y-1'>
          <Label>Max Extensions</Label>
          <Input
            type='number'
            {...form.register('maxExtensions', { valueAsNumber: true })}
          />
        </div>

        <div className='space-y-1'>
          <Label>Minimum Images</Label>
          <Input type='number' {...form.register('minImages', { valueAsNumber: true })} />
        </div>

        {/* Confirm Dialog */}
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogTrigger asChild>
            <Button className='mt-4' disabled={updateSystemSettingMutation.isPending}>
              Save Changes
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Update</AlertDialogTitle>
              <AlertDialogDescription>
                Please review the new system configuration before confirming.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {/* CONFIG PREVIEW */}
            <div className='space-y-2 rounded-lg border p-4 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Auto Extend Threshold</span>
                <span className='font-medium'>
                  {values.autoExtendThresholdMinutes} minutes
                </span>
              </div>

              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Extension Duration</span>
                <span className='font-medium'>{values.extensionDuration} minutes</span>
              </div>

              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Max Extensions</span>
                <span className='font-medium'>{values.maxExtensions}</span>
              </div>

              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Minimum Images</span>
                <span className='font-medium'>{values.minImages}</span>
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={form.handleSubmit(onSubmit)}
                disabled={updateSystemSettingMutation.isPending}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
