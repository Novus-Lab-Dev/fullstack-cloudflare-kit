import { RouterProvider } from '@tanstack/react-router'
import { useEffect } from 'react'

import { FullPageSpinner } from '@/components/full-page-spinner'
import { AuthProvider, useAuth } from '@/providers/auth-provider'
import { QueryProvider } from '@/providers/query-provider'
import { router } from '@/router'

export function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <InnerApp />
      </AuthProvider>
    </QueryProvider>
  )
}

function InnerApp() {
  const auth = useAuth()

  // If the session disappears (e.g. after logout) while we're on a protected
  // route, kick the user to /sign-in immediately.
  useEffect(() => {
    if (!auth.isAuthenticated && router.state.location.pathname !== '/sign-in') {
      router.navigate({ to: '/sign-in' })
    }
  }, [auth.isAuthenticated])

  // Don't mount the router until the initial bootstrap settles so `beforeLoad`
  // always sees a stable auth snapshot.
  if (auth.isLoading) {
    return <FullPageSpinner />
  }

  return <RouterProvider router={router} context={{ auth }} />
}
