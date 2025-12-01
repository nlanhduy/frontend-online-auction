import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { AuthState } from '@/types/auth.types'

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      isAuthenticated: false,

      login: (user, tokens) => {
        localStorage.setItem('accessToken', tokens.accessToken)
        // TODO: BE store the refresh token in cookies so need to implement this
        localStorage.setItem('refreshToken', tokens.refreshToken)
        set({ user, isAuthenticated: true })
      },

      logout: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        set({ user: null, isAuthenticated: false })
      },

      updateUser: updatedUser =>
        set(state => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        })),
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
