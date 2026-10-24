import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { CircleHelp } from 'lucide-react'
import { useForm } from 'react-hook-form'
import type { UseFormReturn } from 'react-hook-form'
import { z } from 'zod'

import { Form, InputCheckbox, SecureInput, TextInput } from '@/components/common/forms'
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

const APP_VERSION = '2.4.207'

const SignInSchema = z.object({
  username: z.string().min(1, 'Username/Student Code is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

type SignInValues = z.infer<typeof SignInSchema>

function SignIn() {
  const { login } = useAuth()
  const form = useForm<SignInValues>({
    resolver: zodResolver(SignInSchema),
    defaultValues: { username: '', password: '', rememberMe: false },
  })

  function onSubmit(values: SignInValues) {
    // Placeholder session until /auth/login is wired up: any non-empty
    // credentials open a session, "Remember me" controls token persistence.
    login(`dev-session.${values.username}`)
  }

  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border md:grid-cols-[1.1fr_1fr]">
        <BrandPanel />
        <SignInForm form={form} onSubmit={onSubmit} />
      </div>
    </div>
  )
}

function BrandPanel() {
  return (
    <aside className="relative hidden flex-col gap-10 overflow-hidden bg-brand p-12 text-white md:flex">
      {/* Decorative circles */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-32 size-[34rem] rounded-full bg-white/5"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-48 size-[26rem] rounded-full bg-white/5"
      />

      {/* Dot grid */}
      <div
        aria-hidden
        className="absolute right-12 top-12 grid grid-cols-8 gap-3 text-white/25"
      >
        {Array.from({ length: 40 }).map((_, index) => (
          <span key={index} className="size-1 rounded-full bg-current" />
        ))}
      </div>

      <div className="relative mt-16 flex flex-col gap-6">
        <h1 className="text-4xl leading-tight font-extrabold tracking-tight">
          Welcome to
          <br />
          SEU UMS
        </h1>
        <p className="max-w-md leading-relaxed text-white/70">
          UMS assists all the members of Southeast University to do a variety of academic and
          co-curricular tasks with well-designed dashboards packed with gorgeous and in-depth
          modules. Making this university paperless is our key objective. Enjoy your journey with
          Southeast University.
        </p>

        <div className="flex items-center gap-4 pt-2">
          <div aria-hidden className="flex -space-x-2.5">
            {(['#c9a227', '#5b6d8f', '#3f8f7a', '#a34f8f'] as const).map((color) => (
              <span
                key={color}
                className="size-9 rounded-full border-2 border-brand"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <p className="text-sm text-white/70">More than 15k students joined us, it’s your turn</p>
        </div>
      </div>

      <p className="relative mt-auto text-right text-sm text-white/60">
        – Made with <span className="text-pink-500">♥</span> by ISDT, SEU
      </p>
    </aside>
  )
}

interface SignInFormProps {
  form: UseFormReturn<SignInValues>
  onSubmit: (values: SignInValues) => void
}

function SignInForm({ form, onSubmit }: SignInFormProps) {
  return (
    <main className="flex flex-col items-center px-6 py-12 sm:px-14">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Logo />

        <h2 className="text-center text-3xl font-bold">Sign in</h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <TextInput
              name="username"
              label="Username/Student Code"
              placeholder="2023100010168"
              required
              autoFocus
            />
            <SecureInput name="password" label="Password" placeholder="••••••••" required />

            <div className="flex items-center justify-between">
              <InputCheckbox name="rememberMe" label="Remember me" />
              <a
                href="#forgot-password"
                className="text-sm font-medium text-info hover:underline"
              >
                Forgot password?
              </a>
            </div>

            <Button type="submit" size="lg" className="mt-2 w-full" disabled={!form.formState.isValid}>
              Sign in
            </Button>
          </form>
        </Form>

        <Button type="button" variant="outline" size="lg" className="w-full gap-2 rounded-full">
          <CircleHelp />
          Important Contact
        </Button>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          Web App Version: {APP_VERSION}
          <span className="h-px flex-1 bg-border" />
        </div>
      </div>
    </main>
  )
}

/** Placeholder university badge until the real logo asset is provided. */
function Logo() {
  return (
    <svg
      aria-label="Southeast University logo"
      viewBox="0 0 96 96"
      className="size-20"
      role="img"
    >
      <circle cx="48" cy="48" r="46" fill="#f5a623" stroke="#193b68" strokeWidth="3" />
      <circle cx="48" cy="48" r="38" fill="#193b68" />
      <path d="M48 26c6 7 9 12 9 18a9 9 0 1 1-18 0c0-6 3-11 9-18z" fill="#f5a623" />
      <rect x="36" y="56" width="24" height="14" rx="2" fill="#168568" />
    </svg>
  )
}