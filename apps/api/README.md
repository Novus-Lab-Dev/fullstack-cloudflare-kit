# SMS API

Cloudflare Worker REST API for the SMS app — a Hono + TypeScript service with Zod validation, Drizzle ORM on Cloudflare D1, JWT auth, MJML email, OpenAPI docs, queues, and cron schedules.

> Looking for coding conventions and architecture rules? See [AGENTS.md](./AGENTS.md).

## Tech stack

| Concern | Choice |
|---|---|
| Runtime | Cloudflare Workers (`wrangler`, `nodejs_compat`) |
| HTTP framework | Hono 4 with custom route decorators (`@Get`, `@Post`, …) |
| Validation | Zod v4 (DTO schemas, auto-validated in controllers) |
| Database | Cloudflare D1 (SQLite) via Drizzle ORM |
| Auth | JWT (HS256) via `hono/jwt` |
| Email | MJML rendered at runtime → MailChannels transactional API |
| Docs | OpenAPI 3.0.3 generated from decorators, Swagger UI |
| Background jobs | Cloudflare Queues (`job-queue`) + cron Triggers |

## Prerequisites

- [Bun](https://bun.sh) ≥ 1.x
- A Cloudflare account (for `--remote` dev, D1, and Queues)
- `wrangler` login: `bunx wrangler login`

## Getting started

```bash
# from the repo root — install workspace deps
bun install

cd apps/api

# local secrets (git-ignored, read automatically by `wrangler dev`)
echo "JWT_SECRET=change-me" > .dev.vars

# apply migrations to the local D1
bun run db:migrate

# run locally (local D1, port 8787)
bun run dev:local

# or run against real Cloudflare bindings (remote D1/queues)
bun run dev
```

The API comes up on the port wrangler prints. Check it:

```bash
curl http://localhost:8787/users
open http://localhost:8787/docs   # Swagger UI
```

### Environment & secrets

| Name | Where set | Purpose |
|---|---|---|
| `JWT_SECRET` | `.dev.vars` (local) / `wrangler secret put JWT_SECRET` (remote) | Sign & verify JWTs |
| `DB` | D1 binding (`wrangler.jsonc`) | SQLite database `api-db` |
| `JOB_QUEUE` | Queue binding (`wrangler.jsonc`) | Producer for `job-queue` |
| `EMAIL_FROM`, `EMAIL_FROM_NAME`, `MAILCHANNELS_ENDPOINT` | `vars` in `wrangler.jsonc` | Email sender identity & endpoint |

If you add a new var, declare it in `wrangler.jsonc` **and** in the `EnvironmentVariables` interface (`src/common/constants/env.ts`), then run `bun run cf-typegen` for binding type updates.

## Scripts

Run from `apps/api/`:

| Command | What it does |
|---|---|
| `bun run dev` | Dev server with **remote** Cloudflare bindings |
| `bun run dev:local` | Dev server with local state (local D1) |
| `bun run check` | Type check (`tsc --noEmit`) |
| `bun run db:generate` | Generate SQL migration from Drizzle schema changes |
| `bun run db:migrate` | Apply migrations to **local** D1 |
| `bun run db:migrate:remote` | Apply migrations to **remote** D1 |
| `bun run db:studio` | Browse the D1 data (`wrangler d1 explorer`) |
| `bun run cf-typegen` | Regenerate Worker binding types |
| `bun run deploy` | Deploy to Cloudflare (`wrangler deploy --minify`) |

## Project structure

```
src/
├── main.ts            # Worker entry: fetch / scheduled / queue handlers
├── app.module.ts      # Registers middlewares, feature modules, docs, error handling
├── api/               # One folder per feature: module + controller + service + dto
│   └── user/          #   e.g. /users routes → UserService → UserRepository
├── db/
│   ├── db-client.ts   # Module-scope Drizzle client (DBClient.client)
│   ├── schema/        # Drizzle table definitions ({domain}.schema.ts)
│   └── contracts/     # Repositories extending BaseRepository ({domain}.repository.ts)
└── common/            # Shared infra: auth, email, helpers, middleware,
                       # openapi, queue, schedule, constants, interfaces
```

Request flow: `Hono → middleware → controller (decorator routes, validation, permissions) → service → repository → D1`.

## API docs

- **Swagger UI:** `GET /docs`
- **OpenAPI JSON:** `GET /docs.json`

The spec is generated automatically from route decorator options (`summary`, `tags`, Zod body/query schemas) — nothing to maintain by hand. Try it:

```bash
# public route
curl http://localhost:8787/users

# protected route (requires role + permissions claims in the JWT)
curl -X POST http://localhost:8787/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"email": "jane@example.com", "name": "Jane"}'
```

## Auth

- Tokens are HS256 JWTs signed with `JWT_SECRET` (`src/common/auth/jwt.helper.ts`); send as `Authorization: Bearer <token>`.
- Route protection is declared per route: `permission: { role, required: [...] }` — the controller checks the JWT's `role` and `permissions` claims (`"*"` grants everything).
- The `AuthorizationMiddleware` registration in `src/common/middleware/index.ts` must be active for `c.get("user")` to be populated on protected routes.

## Database

- Schemas live in `src/db/schema/{domain}.schema.ts` (one file per domain, multiple tables allowed).
- All access goes through repositories in `src/db/contracts/` extending the generic `BaseRepository` (CRUD + query descriptors: `findOne`, `findAll`, `findWithPagination`).
- Workflow after a schema change:

  ```bash
  bun run db:generate            # writes SQL migration
  bun run db:migrate             # apply locally
  bun run db:migrate:remote      # apply on Cloudflare
  ```

## Email

`EmailService.send({ to, subject, template, variables })` renders MJML at runtime and sends via MailChannels' free transactional API (authenticated by the Worker — no API key). Add a template by dropping an `.mjml` file in `src/common/email/` and registering it in the `templates` map.

## Background jobs

- **Queues:** produce with `env.JOB_QUEUE.send(...)`; consumed by `QueueProcessor` (`src/common/queue/`). Jobs are typed via the `QueueJob` union.
- **Cron:** `ScheduleProcessor` (`src/common/schedule/`) runs on the triggers declared in `wrangler.jsonc` (every 15 min, nightly, Mondays at noon).

## Deploy

```bash
bun run db:migrate:remote   # ensure schema is current on remote D1
bun run deploy              # wrangler deploy --minify
```
