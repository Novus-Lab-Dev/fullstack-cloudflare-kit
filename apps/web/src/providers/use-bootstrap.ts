import { useQuery } from '@tanstack/react-query'
import { useCallback, useState } from 'react'

import {
  api,
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from '@/lib/api'
import { readMockUser } from '@/lib/mock-auth'
import type { AuthUser } from '@/interfaces/auth'

const BOOTSTRAP_ENDPOINT = '/auth/me'

export function useBootstrap() {
  const [token, setToken] = useState<string | null>(() => getStoredToken())

  // Mock sessions resolve locally; only real tokens are verified against the API.
  const mockUser = token ? readMockUser(token) : null

  const { data, isPending } = useQuery<AuthUser>({
    queryKey: ['auth', 'me', token],
    queryFn: async () => {
      try {
        return await api.get<AuthUser>(BOOTSTRAP_ENDPOINT)
      } catch {
        // Bootstrap failed: the stored token is invalid/expired, drop it.
        clearStoredToken()
        setToken(null)
        throw new Error('auth bootstrap failed')
      }
    },
    enabled: Boolean(token) && !mockUser,
    retry: false,
    staleTime: Infinity,
  })

  const saveToken = useCallback((nextToken: string) => {
    setStoredToken(nextToken)
    setToken(nextToken)
  }, [])

  const dropToken = useCallback(() => {
    clearStoredToken()
    setToken(null)
  }, [])

  return {
    token,
    data: mockUser ?? data,
    isPending: mockUser ? false : isPending,
    saveToken,
    dropToken,
  }
}
