import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/auth-provider'

export const Route = createFileRoute('/sign-in')({
  component: SignIn,
})

function SignIn() {
  const { login } = useAuth()
  const [token, setToken] = useState('')
  const trimmed = token.trim()

  return (
    <div className="mx-auto mt-24 flex w-full max-w-sm flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Paste a JWT to start a session (placeholder until /auth/login is wired up).
        </p>
      </div>
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          if (trimmed) login(trimmed)
        }}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="token">Token</Label>
          <Input
            id="token"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="eyJhbGciOi..."
            autoFocus
          />
        </div>
        <Button type="submit" disabled={!trimmed}>
          Sign in
        </Button>
      </form>
    </div>
  )
}
