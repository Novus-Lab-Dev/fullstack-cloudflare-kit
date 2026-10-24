# AGENTS.md — `apps/web`

Guidance for AI agents (and humans) working in this web SPA package. Describe patterns here generically; concrete features (e.g. `auth`) are examples of the convention, not the rule.

## Stack

- **Runtime:** Vite SPA (`@vitejs/plugin-react`) targeting browsers. No SSR; mount is a simple `createRoot(...).render(<App />)`.
- **Framework:** React 19 + TypeScript (strict, `verbatimModuleSyntax`).
- **Routing:** TanStack Router v1 file-based (`routes/` directory). Route tree regenerated via `bun run generate-routes`.
- **Data fetching:** TanStack Query v5 (`useQuery`, `queryClient.invalidateQueries`). Shared `queryClient` singleton in `lib/query.ts`.
- **HTTP:** Axios via verb-facade (`api.get<T>`, `api.post<T>`, …) — see API layer below.
- **Forms:** react-hook-form + zod via `@hookform/resolvers/zod`. Shared kit lives at `src/components/common/forms/` (`Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage` + high-level inputs like `TextInput`, `SecureInput`, `SelectInput`, `TextareaInput`, `InputCheckbox`, `SwitchInput`, `RadioInput`, `OtpInput`, `SlugInput`).
- **Table:** `src/components/common/table/` exports `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`, `TableEmpty`.
- **Styling:** Tailwind CSS v4 via `@tailwindcss/vite`. Class merging via `cn` utility.
- **Components:** shadcn/ui primitives (`components/ui/`) + Spectrum UI registry (`components/spectrumui/`). Animation via Framer Motion / Motion.
- **State:** No external state libs. Context providers (`providers/`) for cross-cutting concerns (auth, query client); component-local state for everything else.
- **Devtools:** TanStack Devtools (`@tanstack/react-devtools` + `@tanstack/react-router-devtools` + `@tanstack/react-query-devtools`).

## Commands

| Task | Command |
|---|---|
| Dev server | `bun run dev` |
| Build (production) | `bun run build` |
| Preview build output | `bun run preview` |
| Regenerate route tree | `bun run generate-routes` |
| Lint | `bun run lint` (eslint) |
| Format + lint-fix | `bun run format` |
| Format check | `bun run check` |
| Type check | `./node_modules/.bin/tsc --noEmit` |

## Architecture map

```
src/
├── main.tsx                      # ReactDOM mount → renders <App />
├── app.tsx                       # QueryProvider > AuthProvider > AuthGatedRouter
├── router.tsx                    # createRouter({ routeTree, context: { auth } }) singleton
├── routeTree.gen.ts              # auto-generated; never edit manually
├── styles.css                    # Tailwind import + global layer styles
├── routes/                       # TanStack file-based routes
│   ├── __root.tsx                # createRootRouteWithContext<{ auth: AuthContextValue }>
│   ├── _authenticated.tsx        # pathless layout: beforeLoad guard (unauth → /sign-in)
│   ├── _authenticated/
│   │   ├── index.tsx             # / → redirect to /dashboard (for authenticated users)
│   │   └── dashboard.tsx         # /dashboard
│   └── sign-in.tsx               # /sign-in (public; beforeLoad authed → /dashboard)
├── providers/                    # React context providers + custom hooks
│   ├── auth-provider.tsx         # AuthContext + useAuth
│   ├── use-bootstrap.ts          # owns token state + useQuery('/auth/me')
│   └── query-provider.tsx        # QueryClientProvider + devtools gate
├── lib/                          # shared utilities and clients
│   ├── api.ts                    # axios instance + verb facade + token helpers
│   ├── query.ts                  # queryClient singleton
│   └── utils.ts                  # cn()
├── interfaces/                   # shared types (no runtime code)
│   └── auth.ts                   # AuthUser
└── components/
    ├── full-page-spinner.tsx     # shared loading indicator
    ├── ui/                       # shadcn primitives (button, input, card, …)
    └── spectrumui/               # Spectrum registry components (data-table, …)
```

## Authenticated routing (TanStack Router pattern)

The whole app is **locked** — only `/sign-in` is publicly reachable. Follow the guide: [TanStack Authenticated Routes](https://tanstack.com/router/latest/docs/framework/react/guide/authenticated-routes).

### How it works

1. **Router context** (`router.tsx`): `createRouter({ context: { auth: undefined! } })`. The `auth` value is a placeholder; a real `AuthContextValue` is provided at render time by `<RouterProvider context={{ auth }} />` in `app.tsx`.

2. **Root route** (`__root.tsx`): uses `createRootRouteWithContext<{ auth: AuthContextValue }>()()({ ... })`. This types `context.auth` in every child route's `beforeLoad`.

3. **Pathless layout** (`_authenticated.tsx`): the single guard —
   ```ts
   beforeLoad: ({ context }) => {
     if (!context.auth.isAuthenticated) {
       throw redirect({ to: '/sign-in' })
     }
   }
   component: () => <Outlet />
   ```
   Any route dropped under `_authenticated/` inherits the guard automatically.

4. **Sign-in guard** (`sign-in.tsx`):
   ```ts
   beforeLoad: ({ context }) => {
     if (context.auth.isAuthenticated) {
       throw redirect({ to: '/dashboard' })
     }
   }
   ```

5. **Root redirect** (`_authenticated/index.tsx`): `/` always sends authenticated users to `/dashboard`; the parent's guard handles unauthenticated.

6. **Mount gating** (`app.tsx` `AuthGatedRouter`): renders `<FullPageSpinner>` while `auth.isLoading`; RouterProvider mounts only after bootstrap settles, so `beforeLoad` always sees a stable auth snapshot.

7. **Logout** calls `router.navigate({ to: '/sign-in' })` from within `auth-provider.logout()`, so the redirect is immediate without waiting for the next navigation event.

### Adding new protected routes

Drop the file under `src/routes/_authenticated/` — the guard is inherited. No per-route guard code needed.

```
src/routes/_authenticated/settings.tsx  →  /settings (locked automatically)
```

After creating route files, run `bun run generate-routes`.

### Adding a public route

Put it directly under `src/routes/` (outside `_authenticated/`), e.g. `src/routes/pricing.tsx`.

## Auth provider (`src/providers/`)

### `use-bootstrap.ts`

Owns the token state internally (`useState<string | null>` initialized from localStorage). Wraps a TanStack Query for `/auth/me`:
- `enabled: Boolean(token)` — no fetch without a token.
- On error inside `queryFn`: calls `clearStoredToken()` + resets state (no parent callbacks).
- Exposes `{ token, data, isPending, saveToken, dropToken }`.

### `auth-provider.tsx`

Wraps `useBootstrap()` and derives status:
```
!token → 'unauthenticated'
isPending → 'loading'
data → 'authenticated'
else → 'unauthenticated'
```

Exposes `AuthContextValue` (exported for router context typing):
```ts
export interface AuthContextValue {
  user, token, status, isLoading, isAuthenticated,
  login(token), logout(), hasRole(role), hasPermission(permission)
}
```

- `login(token)` — saveToken + invalidate app-scoped queries.
- `logout()` — dropToken + `queryClient.clear()` + `router.navigate('/sign-in')`.
- No `useEffect` for auth transitions; all side-effects live in action handlers or queryFn's error path.

## API layer (`src/lib/api.ts`)

### Verb facade (use this, never raw axios)

```ts
import { api } from '@/lib/api'

const user = await api.get<AuthUser>('/auth/me')
await api.post('/auth/login', { email, password })
```

Available verbs: `api.get<T>(path)`, `api.post<T>(path, body?)`, `api.put<T>`, `api.patch<T>`, `api.delete<T>`.

### Token handling

- A request interceptor on `apiClient` auto-reads the token from localStorage and attaches `Authorization: Bearer <token>` — no manual header injection needed.
- Token helpers (`getStoredToken`, `setStoredToken`, `clearStoredToken`) are exported for use by `use-bootstrap.ts`.
- API base URL comes from `import.meta.env.VITE_API_URL` (falls back to `http://localhost:8787`).

### Errors

All errors are normalized to `ApiError { status: number, message: string }` inside the internal `request<T>` helper. Never throw raw AxiosError to callers.

## Forms (`src/components/common/forms/`)

The shared kit is react-hook-form + zod + a set of high-level inputs. Always reach for these before writing raw `useForm` + `FormField` composition.

### Layered API

1. **Primitives** (`form.tsx`) — `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`, `useFormField`. Use these when you need a custom control.
2. **Field inputs** — `TextInput`, `TextareaInput`, `SecureInput` (password + show/hide), `SelectInput`, `InputCheckbox`, `SwitchInput`, `RadioInput`, `OtpInput`, `SlugInput`. Each takes `name: FieldPath<T>` and pulls `control` from `useFormContext()` internally; the parent `<Form {...form}>` supplies the context.

### Canonical shape

```tsx
const SignInSchema = z.object({
  token: z.string().min(1, 'Token is required'),
})
type SignInValues = z.infer<typeof SignInSchema>

function SignIn() {
  const form = useForm<SignInValues>({
    resolver: zodResolver(SignInSchema),
    defaultValues: { token: '' },
  })

  function onSubmit(values: SignInValues) {
    /* ... */
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <TextInput name="token" label="Token" required placeholder="eyJhbGciOi..." />
        <Button type="submit" disabled={!form.formState.isValid}>Submit</Button>
      </form>
    </Form>
  )
}
```

### Rules

- Never mix `useState` with `useForm` for the same field — RHF owns the value.
- Only use `FormField` + `FormControl` directly when there's no matching field input; adding a new high-level input is preferred over repeating composition.
- Zod schemas live next to the component that uses them; move to `src/schemas/{domain}.ts` on first cross-route reuse.
- Use `form.formState.isValid` (with `mode: 'onChange'` for live validation) or `form.watch(name)` for reactive UI, not local mirror state.

## Table (`src/components/common/table/`)

Semantic HTML table wrappers: `<Table>` renders a scroll region (`role="region" tabIndex=0`) and provides consistent padding/border tokens via `<TableHeader>`, `<TableBody>`, `<TableRow>`, `<TableHead>`, `<TableCell>`, `<TableCaption>`. Use `<TableEmpty colSpan={n}>` for zero-result states instead of hand-writing a placeholder row.

## TanStack Query usage (`src/lib/query.ts`)

A single shared `queryClient` lives in `lib/query.ts` — import it from anywhere (including non-component code like `auth-provider.tsx`).

Defaults: `staleTime: 60_000`, `retry: 1`, `refetchOnWindowFocus: false`.

Wrap queries with `QueryClientProvider` only in `providers/query-provider.tsx` (rendered by `app.tsx`). For devtools, gate behind `import.meta.env.DEV` (dynamic import, SSR-safe).

## Interfaces (`src/interfaces/{domain}.ts`)

Shared TypeScript interfaces and types that cross module boundaries. No runtime code — types only. Use domain file names (`auth.ts`, `user.ts`, etc.).

Example:
```ts
// src/interfaces/auth.ts
export interface AuthUser {
  sub: string
  role: string
  permissions?: string[]
}
```

## Component conventions

### shadcn primitives — `src/components/ui/`

Install via `bunx --bun shadcn@latest add <name>`. Uses:
- **Variants:** `class-variance-authority` (`cva`).
- **Primitives:** `radix-ui` (Slot, etc.).
- **Class merging:** `cn` (from `@/lib/utils`).
- **Styling:** Tailwind utility classes only; no inline styles for appearance.

### Spectrum UI components — `src/components/spectrumui/`

Install via `bunx --bun shadcn@latest add @spectrumui/<slug> --yes --overwrite` (use `--overwrite` when the component touches an already-existing `ui/` base file). These are pre-built patterns layered on the `ui/` primitives.

### Shared app components — `src/components/`

Components that belong to the app itself (not registry primitives) live flat here:
```
src/components/full-page-spinner.tsx
```

### Route components — `src/routes/`

Route-level components live in their route file directly (not in `components/`). The `Route` const export must be the named export. Use `createFileRoute` from `@tanstack/react-router`.

## Styling

- Tailwind v4: utilities are generated from `src/styles.css` (`@import 'tailwindcss'`). No `tailwind.config.js` — theme tokens are in `@theme { ... }` blocks within `styles.css` or `@layer`.
- Use `cn(...)` from `@/lib/utils` for conditional class composition.
- Do not use inline `style={{}}` for appearance unless required for computed/dynamic values (e.g., CSS custom properties).

## Code style

- **Semicolons:** none.
- **Quotes:** single.
- **Trailing commas:** yes (es5 style).
- **Type imports:** always `import type { ... }` (verbatimModuleSyntax enabled).
- **Unused:** `noUnusedLocals`, `noUnusedParameters` — remove all unused vars/imports before checking in.
- **Path alias:** `@/*` maps to `./src/*`. Use it for all non-relative imports across directories.
- **No `React` default import:** React 17+ auto JSX runtime; don't write `import React from 'react'` unless the default export is actually needed.

## Misc rules

- The route tree (`routeTree.gen.ts`) is auto-generated by the `@tanstack/router-plugin` Vite plugin or `tsr generate`. Never hand-edit.
- When creating new route files, be aware that the router plugin may append auto-generated stubs. Strip any appended duplicate `RouteComponent` stub after writing your component.
- `router.tsx` exports a singleton — import it wherever `router.navigate()` is needed outside a React component (e.g. `auth-provider.logout()`).
- Avoid `useEffect` for state transitions that can be handled directly in event handlers or queryFn (login/logout actions); this keeps the dependency graph simple.
- All environment-specific API config comes from `import.meta.env.VITE_*` variables; add a `.env.example` entry when introducing new ones.
