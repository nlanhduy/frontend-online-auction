import { Navigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'

import { useAuthStore } from '@/store/authStore'

import type { UserRole } from '@/types/auth.types'

interface ProtectedRouteProps {
  children?: React.ReactNode
  allowedRoles: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()
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
      guest: '/',
      bidder: '/',
      seller: '/seller/products',
      admin: '/admin',
    }

    return <Navigate to={redirectMap[user.role]} replace />
  }

  return <>{children}</>
}
