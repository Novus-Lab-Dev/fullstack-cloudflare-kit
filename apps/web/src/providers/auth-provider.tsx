import { useNavigate, useRouterState } from '@tanstack/react-router'
import { createContext, useCallback, useContext, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'

import { FullPageSpinner } from '@/components/full-page-spinner'
import { queryClient } from '@/lib/query'
import type { AuthUser } from '@/interfaces/auth'

import { useBootstrap } from './use-bootstrap'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthContextValue {
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

const PROTECTED_PREFIX = '/dashboard'
const SIGN_IN_PATH = '/sign-in'

export function AuthProvider({ children }: { children: ReactNode }) {
  const { token, data, isPending, saveToken, dropToken } = useBootstrap()
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  const user = data ?? null
  const status: AuthStatus = !token
    ? 'unauthenticated'
    : isPending
      ? 'loading'
      : user
        ? 'authenticated'
        : 'unauthenticated'

  const isProtectedRoute =
    pathname === PROTECTED_PREFIX || pathname.startsWith(`${PROTECTED_PREFIX}/`)
  const isSignInRoute = pathname === SIGN_IN_PATH

  // Centralized auth redirect: guard runs whenever status or route changes.
  useEffect(() => {
    if (status === 'unauthenticated' && isProtectedRoute) {
      navigate({ to: SIGN_IN_PATH })
    }
    if (status === 'authenticated' && isSignInRoute) {
      navigate({ to: PROTECTED_PREFIX })
    }
  }, [status, isProtectedRoute, isSignInRoute, navigate])

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

  if (status === 'loading') {
    return <FullPageSpinner />
  }
  if (status === 'unauthenticated' && isProtectedRoute) {
    return <FullPageSpinner label="Redirecting to sign in..." />
  }
  if (status === 'authenticated' && isSignInRoute) {
    return <FullPageSpinner label="Redirecting to dashboard..." />
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
