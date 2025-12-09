import { Navigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'

import { useAuth } from '@/hooks/use-auth'
import { UserRole } from '@/types/auth.types'

interface ProtectedRouteProps {
  children?: React.ReactNode
  allowedRoles: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    toast.error('Please log in to continue')
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  // Authenticated but wrong role - redirect to home with error
  if (user && !allowedRoles.includes(user.role)) {
    toast.error('You do not have permission to access this page')

    const redirectMap: Record<UserRole, string> = {
      [UserRole.Guest]: '/',
      [UserRole.Bidder]: '/',
      [UserRole.Seller]: '/seller/products',
      [UserRole.Admin]: '/admin',
    }

    return <Navigate to={redirectMap[user.role]} replace />
  }

  return <>{children}</>
}
