# AGENTS.md — `apps/api`

Guidance for AI agents (and humans) working in this API package. Describe patterns here generically; concrete features (e.g. `user`) are examples of the convention, not the rule.

## Stack

- **Runtime:** Cloudflare Workers (`bun` scripts via `wrangler`). No Node APIs — anything that must run at module scope cannot rely on a `Context` (see Environment below).
- **HTTP framework:** Hono + custom TypeScript decorators (`experimentalDecorators`), route metadata registered at class-definition time.
- **Validation:** Zod v4. DTOs are Zod schemas + `z.infer` types; validation runs automatically in the controller wrapper (`validateBody` / `validateQuery`).
- **ORM:** Drizzle ORM + Cloudflare D1 (SQLite). Migrations via `drizzle-kit generate` + `wrangler d1 migrations apply`.
- **Docs:** OpenAPI spec is auto-generated from decorator options; Swagger UI at `/docs`, spec at `/docs.json`.

## Commands

| Task | Command |
|---|---|
| Dev (remote bindings) | `bun run dev` |
| Dev (local D1) | `bun run dev:local` |
| Type check | `bun run check` (`tsc --noEmit`) |
| Generate migration | `bun run db:generate` |
| Apply migrations (local / remote) | `bun run db:migrate` / `bun run db:migrate:remote` |
| Regenerate binding types | `bun run cf-typegen` → `worker-configuration.d.ts` |

## Architecture map

```
src/
├── main.ts                  # Worker entry: fetch / scheduled / queue → AppModule
├── app.module.ts            # root module: middlewares, feature modules, docs, 404/500
├── api/{feature}/           # one folder per API feature (module/controller/service/dto)
├── db/
│   ├── db-client.ts         # module-scope Drizzle client (DBClient.client)
│   ├── schema/{domain}.schema.ts       # table definitions + inferred row types
│   └── contracts/{domain}.repository.ts # repositories (hexagonal persistence layer)
└── common/                  # shared infrastructure (see sections below)
    ├── auth/                # JwtHelper
    ├── constants/           # Environment (env.ts) + shared fixed values (index.ts)
    ├── email/               # EmailService + *.mjml templates
    ├── helpers/             # ResponseHelper, validation.helper
    ├── interfaces/          # AppEnv, IController, IModule, User
    ├── middleware/          # Middleware classes + MiddlewareRegistry
    ├── openapi/             # spec generation + Swagger UI setup
    ├── queue/               # QueueProcessor + QueueJob types
    └── schedule/            # ScheduleProcessor
```

Layering rule (hexagonal): `controller → service → repository contract → db`. Controllers never touch Drizzle; services extend repository contracts; only repositories know tables and the DB client.

## Database convention (`src/db/`)

### Schema — `src/db/schema/{domain}.schema.ts`

One file per domain; a single domain file may hold **multiple tables**. Name tables `{entity}Table` and export both inferred row types:

```ts
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const postsTable = sqliteTable("posts", {
    id: integer().primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
});

export type PostRow = typeof postsTable.$inferSelect;
export type NewPostRow = typeof postsTable.$inferInsert;
```

### Contracts (repositories) — `src/db/contracts/{domain}.repository.ts`

All persistence goes through a **repository** extending the generic, table-driven `BaseRepository`; re-export row types as `{Entity}Record` / `New{Entity}Record`:

```ts
import { eq } from "drizzle-orm";
import { postsTable, type NewPostRow, type PostRow } from "../schema/posts.schema";
import { BaseRepository, type D1Client } from "./base.repository";

export type PostRecord = PostRow;
export type NewPostRecord = NewPostRow;

export class PostRepository extends BaseRepository<typeof postsTable> {
    constructor(db: D1Client) {
        super(db, postsTable, postsTable.id);
    }

    async findByTitle(title: string): Promise<PostRecord | null> {
        return await this.findOne({ where: eq(postsTable.title, title) });
    }
}
```

`BaseRepository` provides CRUD (`create`, `update`, `delete`) plus query-descriptor reads (`findOne` / `findAll` / `findWithPagination` accepting `{ select, where, orderBy, limit, skip, page }`). Add only domain-specific finders in the repository; keep generic reads in the base and express them as query descriptors, not raw SQL.

The DB client is a module-scope static (`db-client.ts`): `DBClient.client` — a `DrizzleD1Database` built from `cloudflare:workers` `env.DB`. Services are constructed with it; repositories receive it via constructor.

After schema changes: run `bun run db:generate`, then apply migrations. Never edit generated SQL by hand.

## Environment (`src/common/constants/env.ts`)

The `EnvironmentVariables` interface types every secret/var read through Hono's `env(c)`:

```ts
interface EnvironmentVariables {
    DATABASE_URL: string
    JWT_SECRET: string
    EMAIL_FROM: string
    EMAIL_FROM_NAME: string
    MAILCHANNELS_ENDPOINT: string
}
```

**Whenever you add a new environment variable, add its type to this interface too**, then read it via:

- `Environment.getByContext(key, c)` — optional read inside a request context.
- `Environment.requireByContext(key, c)` — throws if missing.

Worker module-scope bindings (`env.DB`, queues, vars declared in `wrangler.jsonc`) are a separate mechanism: they come from `cloudflare:workers` `env` and are typed via `bun run cf-typegen` — not through this interface.

## Constants (`src/common/constants/index.ts`)

Use this file for shared fixed values/strings (route paths, header names, default messages, enum-like literals) instead of hardcoding text inline. Import from `common/constants` in services, controllers, and middleware.

## Validation (`src/common/helpers/validation.helper.ts`)

Do not call this manually in handlers — the `IController` route wrapper already runs `validateBody` / `validateQuery` against the Zod schema from the decorator options and short-circuits with `400 BAD_REQUEST` (formatted Zod issues) on failure. Use `validateWithSchema` directly only for ad-hoc validation outside the request pipeline (e.g. inside a service parsing a queue payload).

## OpenAPI (`src/common/openapi/`)

Docs are generated automatically from decorator options — never hand-write OpenAPI:

- `IController` calls `registerRoutesForDocs` with each route's `{ method, path, options }`; `summary`, `tags`, `body`, `query` feed the spec. Docs paths include the controller's `static basePath`; route registration does not (Hono `basePath` applies it at mount time) — do not repeat the base path in decorator route paths.
- `schema.generator.ts` converts Zod schemas to JSON Schema under `components.schemas`.
- `setupOpenApi(app, "/docs")` (wired via `AppModule.setupDocs()`) serves Swagger UI at `/docs` and the spec at `/docs.json`.
- Describe DTO fields with `.describe("...")` so they show up in the generated docs.

## User type (`src/common/interfaces/user.interface.ts`)

The canonical JWT/auth user shape shared across `JwtHelper`, `AuthorizationMiddleware`, `AppEnv.Variables.user`, and route permission checks:

```ts
export type User = {
    sub: string;            // subject (user id)
    role: string;           // matched against route permission `role`
    permissions?: string[]; // granted perms; ["*"] grants everything
    exp: number;            // expiry claim (unix seconds)
};
```

## JWT (`src/common/auth/jwt.helper.ts`)

Instantiate once per consumer; `sign`/`verify` take the Hono `Context` (the helper reads `JWT_SECRET` from it) and **must be awaited**:

```ts
const jwt = new JwtHelper();

const token = await jwt.sign(user, context);   // payload extends User
const user = await jwt.verify(token, context); // returns User
```

`AuthorizationMiddleware` uses this helper to verify Bearer tokens and set `c.set("user", payload)`. HS256 by default.

## Email (`src/common/email/email.service.ts`)

`EmailService` is a static-class helper (mirrors `ResponseHelper` style). It renders **MJML at runtime** (`mjml-browser`) and sends via MailChannels' transactional HTTP API (no API key; authenticated by the Worker).

```ts
await EmailService.send({
    to: "user@example.com",
    subject: "Welcome",
    template: "base",                        // optional, defaults to "base"
    variables: { name: "John" },             // {{name}} escaped, {{{name}}} raw
});
```

To add a template: create `{name}.mjml` next to `base.mjml`, import it in `email.service.ts`, and register it in the `templates` map — the key becomes selectable via the `EmailTemplate` type automatically.

## API feature convention (`src/api/{feature}/`)

Each feature is a folder under `src/api/`; name everything after the feature (plural noun for routes, e.g. `posts`):

```
src/api/{feature}/
├── {feature}.module.ts      # wires controller into a Hono sub-app
├── {feature}.controller.ts  # routes + permission/validation decorators
├── {feature}.service.ts     # business logic, extends the repository contract
└── dto/{name}.dto.ts        # one file per DTO group when multiple exist
    # or {feature}.dto.ts    # single file when only one DTO group is needed
```

### Service

Extends the domain repository and adds business logic on top of it (no Drizzle access outside the repository layer):

```ts
export class PostService extends PostRepository {
    constructor(db: D1Client) {
        super(db);
    }
}
```

### Controller

Extends `IController`; declare `static basePath` as the plural route segment. Decorator options carry validation schema, OpenAPI metadata, and permissions. Handlers receive `(c: HandlerContext, body, query)` — `body`/`query` types are inferred from the Zod schema in the decorator. Always respond via `ResponseHelper`:

```ts
export class PostController extends IController {
    static basePath?: string | undefined = "/posts";
    private postService = new PostService(DBClient.client);

    constructor(app: Hono<AppEnv>) {
        super(app);
    }

    @Post("/", {
        body: CreatePostSchema,
        summary: "Create a Post",
        tags: ["Posts"],
        permission: { role: "admin", required: ["post.manage"] },
    })
    async create(c: HandlerContext, payload: CreatePostDto) {
        const post = await this.postService.create(payload);
        return ResponseHelper.success(post, { status: 201 });
    }

    @Get("/:id", {
        summary: "Get post by id",
        tags: ["Posts"],
        permission: { role: "user", required: ["post.read"] },
    })
    async getById(c: HandlerContext) {
        const post = await this.postService.findOne({ where: eq(postsTable.id, Number(c.req.param("id"))) });
        return ResponseHelper.success(post);
    }
}
```

Available decorators: `@Get`, `@Post`, `@Put`, `@Patch`, `@Delete` — signature `(path, options?)` with `options: { body?, query?, summary?, tags?, permission? }`. Route paths in decorators are **relative to `basePath`** (the module's Hono `basePath` supplies the prefix at mount time).

### Module

Extends `IModule`, passes the controller's `basePath` to `super`, and instantiates the controller with the sub-app:

```ts
export class PostModule extends IModule {
    constructor() {
        super(PostController.basePath);
        new PostController(this.app);
    }
}
```

### Registering a feature

1. Create `src/api/{feature}/` with module/controller/service (+ dto files), backed by a `{domain}.schema.ts` and `{domain}.repository.ts` if new to the domain.
2. Add the module class to the `modules` array in `src/app.module.ts` — `AppModule.routes()` mounts each via `app.route("/", module.geApp())`.
3. Run `bun run check`, then verify the feature appears in `/docs`.

## Permissions & roles

Defined per route in decorator `permission` (`RoutePermission`):

```ts
permission: {
    role: "admin",              // must match the JWT `role` claim
    required: ["post.manage"],  // permissions the JWT user must hold
}
```

Flow:
1. `AuthorizationMiddleware` (registered in `MiddlewareRegistry` against `AuthorizationMiddleware.protectedPath`) verifies the Bearer JWT and sets `c.get("user")`.
2. `IController`'s route wrapper calls `checkPermission` before the handler: role mismatch or any missing permission → `403 FORBIDDEN` via `ResponseHelper.error`.
3. A user permission of `"*"` grants everything.

Conventions:
- Permission strings follow `{resource}.{action}` (`post.read`, `post.manage`); pick a role per route deliberately or leave `permission` off for public routes.
- Auth enforcement is a one-line registration in `MiddlewareRegistry.register()` — check that the `AuthorizationMiddleware` line is active before assuming protected routes are enforced, and keep sensitive routes protected in every environment.

## Response convention

Never return raw `Response.json(...)` from handlers. Use `ResponseHelper.success(data, { status?, message? })` and `ResponseHelper.error(message, { status, code })` with codes from `Code` (`AUTH_FAILED | FORBIDDEN | NOT_FOUND | BAD_REQUEST | SERVER_ERROR`). Global 404/500 handling lives in `AppModule.notFound()` / `onError()` — don't add per-handler equivalents.

## Queue & schedule

Worker entry (`src/main.ts`) forwards `scheduled` and `queue` handlers to `AppModule`, which delegates to `ScheduleProcessor` and `QueueProcessor` (`src/common/schedule|queue/`). Queue jobs are typed via the `QueueJob` union and bound as `JOB_QUEUE` (`AppEnv.Bindings`); add new job kinds there (plus a branch in the processor), not ad-hoc payloads.

## Misc rules

- All Hono generics use `AppEnv` (`src/common/interfaces/app-env.interface.ts`) — extend `Bindings`/`Variables` there when adding D1/Queue/vars usage; never widen types locally.
- Middleware classes extend `Middleware` (`middleware.interface.ts`) and expose the handler as an arrow-function property `use = async (c, next) => {...}` so `this` stays bound when registered via `app.use(path, mw.use)`.
- Shared services/helpers are static classes (`ResponseHelper`, `EmailService`) or contextless classes instantiated once per consumer (`JwtHelper`, repositories) — nothing in `common/` may hold request state.
- Naming: files are `dot.case` (`{feature}.controller.ts`, `{name}.mjml`); classes are PascalCase; tables are `{entity}Table`; DTO schemas are `{Action}{Entity}Schema` with types `{Action}{Entity}Dto`.
- Prefer fixing the shared abstraction (`BaseRepository`, `IController`, helpers) over duplicating logic in a feature; keep feature-specific code inside its folder.
