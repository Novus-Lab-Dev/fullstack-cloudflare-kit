import { createFileRoute, redirect } from '@tanstack/react-router'

import { AppShell } from '@/components/app-shell'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: '/sign-in' })
    }
  },
  component: AppShell,
})
