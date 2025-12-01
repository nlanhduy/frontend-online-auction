/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { QUERY_KEYS } from '@/constants/queryKey'
import { APIService } from '@/services/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Login Mutation
export const useLogin = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: QUERY_KEYS.auth.login,
    mutationFn: async (data: any) => {
      const response = await APIService.login({
        options: { data },
      })
      return response.data
    },
    onSuccess: (data: any) => {
      // Store tokens
      localStorage.setItem('accessToken', data.tokens.accessToken)
      //TODO: set cookie here
      localStorage.setItem('refreshToken', data.tokens.refreshToken)

      // Update query cache
      queryClient.setQueryData(QUERY_KEYS.auth.me, data.user)

      toast.success('Login successful!', {
        description: 'Welcome back to AuctionHub',
      })

      navigate('/')
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
      const response = await APIService.register({
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
      const response = await APIService.verifyOTP({
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
      const response = await APIService.resendOTP({
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
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: QUERY_KEYS.auth.logout,
    mutationFn: async () => {
      const response = await APIService.logout({
        options: {},
      })
      return response.data
    },
    onSuccess: () => {
      // Clear tokens
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')

      // Clear all queries
      queryClient.clear()

      toast.success('Logged out successfully')
      navigate('/login')
    },
    onError: () => {
      // Still clear tokens even if API fails
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      queryClient.clear()
      navigate('/login')
    },
  })
}

// Get Current User Query
export const useCurrentUser = () => {
  return useQuery({
    queryKey: QUERY_KEYS.auth.me,
    queryFn: async () => {
      const response = await APIService.getMe({
        options: {},
      })
      return response.data
    },
    enabled: !!localStorage.getItem('accessToken'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  })
}
