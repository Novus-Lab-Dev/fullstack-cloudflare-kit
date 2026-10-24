import { RouterProvider } from '@tanstack/react-router'

import { FullPageSpinner } from '@/components/full-page-spinner'
import { AuthProvider, useAuth } from '@/providers/auth-provider'
import { QueryProvider } from '@/providers/query-provider'
import { router } from '@/router'

export function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <AuthGatedRouter />
      </AuthProvider>
    </QueryProvider>
  )
}

function AuthGatedRouter() {
  const auth = useAuth()

  if (auth.isLoading) {
    return <FullPageSpinner />
  }

  return <RouterProvider router={router} context={{ auth }} />
}
