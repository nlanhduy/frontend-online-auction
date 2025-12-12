import { BadgeCheckIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { UserRole } from '@/types/auth.types'

import type { User } from '@/types/auth.types'
export function UserCard({
  user,
  isOwner = false,
}: {
  user?: User | null
  isOwner?: boolean
}) {
  const getRoleBadgeVariant = (role: string | null) => {
    if (!role) return null
    switch (role.toUpperCase()) {
      case UserRole.Bidder:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case UserRole.Seller:
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
      case UserRole.Admin:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const getRoleLabel = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
  }

  return (
    <div className='flex items-center gap-3'>
      <div className='w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center flex-shrink-0'>
        <span className='font-semibold text-sm text-foreground'>
          {user?.fullName
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)}
        </span>
      </div>

      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2 flex-wrap'>
          <p className='font-semibold text-foreground text-sm'>{user?.fullName}</p>
          <Badge
            className={`${getRoleBadgeVariant(user?.role || UserRole.Bidder)} text-xs font-medium`}>
            {getRoleLabel(user?.role || UserRole.Bidder)}
          </Badge>
          {isOwner && (
            <Badge
              variant='secondary'
              className='bg-blue-500 text-white dark:bg-blue-600'>
              <BadgeCheckIcon />
              Owner
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}
