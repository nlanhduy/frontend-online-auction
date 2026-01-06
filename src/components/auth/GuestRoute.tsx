import { Navigate } from 'react-router-dom'

import { useAuth } from '@/hooks/use-auth'
import { UserRole } from '@/types/auth.types'

interface GuestRouteProps {
  children?: React.ReactNode
}

export const redirectMap: Record<UserRole, string> = {
  [UserRole.Guest]: '/',
  [UserRole.Bidder]: '/',
  [UserRole.Seller]: '/seller/products',
  [UserRole.Admin]: '/admin',
}

export function GuestRoute({ children }: GuestRouteProps) {
  const { isAuthenticated, user } = useAuth()

  if (isAuthenticated && user) {
    return <Navigate to={redirectMap[user.role]} replace />
  }

  return <>{children}</>
}
