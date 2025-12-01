export const QUERY_KEYS = {
  // Auth related
  auth: {
    login: ['auth', 'login'] as const,
    register: ['auth', 'register'] as const,
    verifyOTP: ['auth', 'verify-otp'] as const,
    resendOTP: ['auth', 'resend-otp'] as const,
    refresh: ['auth', 'refresh'] as const,
    logout: ['auth', 'logout'] as const,
    me: ['auth', 'me'] as const,
  },

  user: {
    profile: (userId: string) => ['user', 'profile', userId] as const,
    all: ['user', 'all'] as const,
  },
} as const
