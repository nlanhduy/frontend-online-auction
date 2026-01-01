/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { QUERY_KEYS } from '@/constants/queryKey'
import { AuthAPI } from '@/services/api/auth.api'
import { useAuthStore } from '@/store/authStore'
// hooks/use-google-auth.ts
import { useMutation } from '@tanstack/react-query'

export const useGoogleAuth = () => {
  const navigate = useNavigate()
  const setAuth = useAuthStore(state => state.setAuth)

  return useMutation({
    mutationKey: QUERY_KEYS.auth.googleLogin,
    mutationFn: async (accessToken: string) => {
      localStorage.setItem('accessToken', accessToken)

      const response = await AuthAPI.getMe({
        options: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      })
      return {
        user: response.data,
        accessToken,
      }
    },
    onSuccess: data => {
      if (data.user && data.accessToken) {
        setAuth(data.user, data.accessToken)

        toast.success('Login successful!', {
          description: 'Welcome to AuctionHub',
        })

        navigate('/')
      } else {
        console.error('Invalid Google auth response structure:', data)
        toast.error('Login failed', {
          description: 'Invalid response from server',
        })
      }
    },
    onError: (error: any) => {
      localStorage.removeItem('accessToken')
      toast.error('Google authentication failed', {
        description:
          error.response?.data?.message ||
          'Failed to complete authentication. Please try again.',
      })

      navigate('/login')
    },
  })
}

export const useInitiateGoogleAuth = () => {
  return () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    window.location.href = `${apiUrl}/auth/google`
  }
}
