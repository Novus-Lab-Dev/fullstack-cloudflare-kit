import { createFileRoute } from '@tanstack/react-router'

import { useAuth } from '@/providers/auth-provider'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {user ? (
        <p className="mt-2 text-sm text-neutral-600">
          Signed in as {user.sub} ({user.role})
        </p>
      ) : null}
    </div>
  )
}
