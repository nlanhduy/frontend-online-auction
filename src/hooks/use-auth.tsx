/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/auth.hooks.ts
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { QUERY_KEYS } from '@/constants/queryKey'
import { AuthAPI } from '@/services/api/auth.api'
import { useAuthStore } from '@/store/authStore'
import { useMutation, useQuery } from '@tanstack/react-query'

// Hook to get auth state from Zustand
export const useAuth = () => {
  const user = useAuthStore(state => state.user)
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const accessToken = useAuthStore(state => state.accessToken)

  return {
    user,
    isAuthenticated,
    accessToken,
  }
}

// Login Mutation
export const useLogin = () => {
  const navigate = useNavigate()
  const setAuth = useAuthStore(state => state.setAuth)

  return useMutation({
    mutationKey: QUERY_KEYS.auth.login,
    mutationFn: async (data: any) => {
      const response = await AuthAPI.login({
        options: { data },
      })
      return response.data
    },
    onSuccess: (data: any) => {
      if (data.user && data.accessToken) {
        setAuth(data.user, data.accessToken)

        toast.success('Login successful!', {
          description: 'Welcome back to AuctionHub',
        })

        navigate('/')
      } else {
        console.error('Invalid login response structure:', data)
        toast.error('Login failed', {
          description: 'Invalid response from server',
        })
      }
    },
    onError: (error: any) => {
      toast.error('Login failed', {
        description:
          error.response?.data?.message || 'Invalid email or password. Please try again.',
      })
    },
  })
}

// Register Mutation
export const useRegister = (onSuccess?: (email: string) => void) => {
  return useMutation({
    mutationKey: QUERY_KEYS.auth.register,
    mutationFn: async (data: any) => {
      const response = await AuthAPI.register({
        options: { data },
      })
      return response.data
    },
    onSuccess: (data: any) => {
      toast.success('Registration successful!', {
        description: 'Please verify your email with the OTP code',
      })

      if (onSuccess) {
        onSuccess(data.email)
      }
    },
    onError: (error: any) => {
      toast.error('Registration failed', {
        description:
          error.response?.data?.message ||
          'Email might already be in use. Please try again.',
      })
    },
  })
}

// Verify OTP Mutation
export const useVerifyOTP = (onSuccess?: () => void) => {
  const navigate = useNavigate()

  return useMutation({
    mutationKey: QUERY_KEYS.auth.verifyOTP,
    mutationFn: async (data: any) => {
      const response = await AuthAPI.verifyOTP({
        options: { data },
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('Email verified successfully!', {
        description: 'You can now login to your account',
      })

      if (onSuccess) {
        onSuccess()
      } else {
        navigate('/login')
      }
    },
    onError: (error: any) => {
      toast.error('Verification failed', {
        description:
          error.response?.data?.message || 'Invalid OTP code. Please try again.',
      })
    },
  })
}

// Resend OTP Mutation
export const useResendOTP = () => {
  return useMutation({
    mutationKey: QUERY_KEYS.auth.resendOTP,
    mutationFn: async (data: any) => {
      const response = await AuthAPI.resendOTP({
        options: { data },
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('OTP sent!', {
        description: 'A new OTP code has been sent to your email',
      })
    },
    onError: (error: any) => {
      toast.error('Failed to resend OTP', {
        description: error.response?.data?.message || 'Please try again later',
      })
    },
  })
}

// Logout Mutation
export const useLogout = () => {
  const navigate = useNavigate()
  const clearAuth = useAuthStore(state => state.clearAuth)

  return useMutation({
    mutationKey: QUERY_KEYS.auth.logout,
    mutationFn: async () => {
      const response = await AuthAPI.logout({
        options: {},
      })
      return response.data
    },
    onSuccess: () => {
      // Clear Zustand store (also clears localStorage via persist middleware)
      clearAuth()

      toast.success('Logged out successfully')
      navigate('/login')
    },
    onError: () => {
      // Still clear auth even if API fails
      clearAuth()
      navigate('/login')
    },
  })
}

// Get Current User Query
export const useCurrentUser = () => {
  const accessToken = useAuthStore(state => state.accessToken)
  const setUser = useAuthStore(state => state.setUser)
  const clearAuth = useAuthStore(state => state.clearAuth)

  return useQuery({
    queryKey: QUERY_KEYS.auth.me,
    queryFn: async () => {
      const response = await AuthAPI.getMe({
        options: {},
      })
      return response.data
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    select: data => {
      // Update user in Zustand store when data is fetched
      setUser(data)
      return data
    },
    // Fallback to clear auth if query fails
    meta: {
      onError: () => {
        clearAuth()
      },
    },
  })
}
