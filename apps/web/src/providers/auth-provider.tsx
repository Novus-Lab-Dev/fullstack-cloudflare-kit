import { createContext, useCallback, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'

import { queryClient } from '@/lib/query'
import { router } from '@/router'
import type { AuthUser } from '@/interfaces/auth'

import { useBootstrap } from './use-bootstrap'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  status: AuthStatus
  isLoading: boolean
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
  hasRole: (role: string) => boolean
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { token, data, isPending, saveToken, dropToken } = useBootstrap()

  const user = data ?? null
  const status: AuthStatus = !token
    ? 'unauthenticated'
    : isPending
      ? 'loading'
      : user
        ? 'authenticated'
        : 'unauthenticated'

  const login = useCallback(
    (nextToken: string) => {
      saveToken(nextToken)
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] !== 'auth',
      })
    },
    [saveToken],
  )

  const logout = useCallback(() => {
    dropToken()
    queryClient.clear()
    router.navigate({ to: '/sign-in' })
  }, [dropToken])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      status,
      isLoading: status === 'loading',
      isAuthenticated: status === 'authenticated',
      login,
      logout,
      hasRole: (role) => user?.role === role,
      hasPermission: (permission) =>
        user?.role === 'admin' || (user?.permissions?.includes(permission) ?? false),
    }),
    [user, token, status, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
