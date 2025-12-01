import { Navigate } from 'react-router-dom'

import { useAuthStore } from '@/store/authStore'
import { UserRole } from '@/types/auth.types'

interface GuestRouteProps {
  children?: React.ReactNode
}

export function GuestRoute({ children }: GuestRouteProps) {
  const { isAuthenticated, user } = useAuthStore()

  if (isAuthenticated && user) {
    const redirectMap: Record<UserRole, string> = {
      [UserRole.Guest]: '/',
      [UserRole.Bidder]: '/profile',
      [UserRole.Seller]: '/seller/products',
      [UserRole.Admin]: '/admin',
    }

    return <Navigate to={redirectMap[user.role]} replace />
  }

  return <>{children}</>
}
