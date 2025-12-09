// src/stores/auth.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { User } from '@/types/auth.types'

interface AuthStore {
  // State
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean

  // Actions
  setAuth: (user: User, accessToken: string) => void
  setUser: (user: User | null) => void
  updateUser: (updates: Partial<User>) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    set => ({
      // Initial State
      user: null,
      accessToken: null,
      isAuthenticated: false,

      // Set both user and token (used after login)
      setAuth: (user, accessToken) => {
        set({
          user,
          accessToken,
          isAuthenticated: true,
        })
      },

      // Set user only (used when fetching current user)
      setUser: user =>
        set(state => ({
          user,
          isAuthenticated: !!user && !!state.accessToken,
        })),

      // Update user partially
      updateUser: updates =>
        set(state => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      // Clear all auth data
      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
