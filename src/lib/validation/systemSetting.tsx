import * as z from 'zod'

export const systemSettingSchema = z.object({
  autoExtendThresholdMinutes: z
    .number()
    .min(1, 'Auto extend threshold must be at least 1 minute')
    .max(60, 'Auto extend threshold must not exceed 60 minutes'),
  extensionDuration: z
    .number()
    .min(1, 'Extension duration must be at least 1 minute')
    .max(60, 'Extension duration must not exceed 60 minutes'),
  maxExtensions: z
    .number()
    .min(1, 'Max extensions must be at least 1')
    .max(10, 'Max extensions must not exceed 10'),
  minImages: z
    .number()
    .min(1, 'Min images must be at least 1')
    .max(10, 'Min images must not exceed 10'),
})
export type SystemSetting = z.infer<typeof systemSettingSchema>
