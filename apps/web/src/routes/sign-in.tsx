import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Form, TextInput } from '@/components/common/forms'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/providers/auth-provider'

export const Route = createFileRoute('/sign-in')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: SignIn,
})

const SignInSchema = z.object({
  token: z.string().min(1, 'Token is required'),
})

type SignInValues = z.infer<typeof SignInSchema>

function SignIn() {
  const { login } = useAuth()
  const form = useForm<SignInValues>({
    resolver: zodResolver(SignInSchema),
    defaultValues: { token: '' },
  })

  function onSubmit(values: SignInValues) {
    login(values.token.trim())
  }

  return (
    <div className="mx-auto mt-24 flex w-full max-w-sm flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Paste a JWT to start a session (placeholder until /auth/login is wired up).
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <TextInput name="token" label="Token" placeholder="eyJhbGciOi..." required autoFocus />
          <Button type="submit" disabled={!form.formState.isValid}>
            Sign in
          </Button>
        </form>
      </Form>
    </div>
  )
}
