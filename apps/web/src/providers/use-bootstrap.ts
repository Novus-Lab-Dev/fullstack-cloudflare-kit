import { useQuery } from '@tanstack/react-query'
import { useCallback, useState } from 'react'

import { api, clearStoredToken, getStoredToken, setStoredToken } from '@/lib/api'
import type { AuthUser } from '@/interfaces/auth'

const BOOTSTRAP_ENDPOINT = '/auth/me'

export function useBootstrap() {
  const [token, setToken] = useState<string | null>(() => getStoredToken())

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
    enabled: Boolean(token),
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

  return { token, data, isPending, saveToken, dropToken }
}
