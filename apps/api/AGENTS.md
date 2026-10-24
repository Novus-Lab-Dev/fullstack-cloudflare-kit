# AGENTS.md — `apps/api`

Guidance for AI agents (and humans) working in this API package.

## Stack

- **Runtime:** Cloudflare Workers (`bun` scripts via `wrangler`). No Node APIs — anything that must run at module scope cannot rely on a `Context` (see Environment below).
- **HTTP framework:** Hono + custom TypeScript decorators (`experimentalDecorators`), route metadata registered at class-definition time.
- **Validation:** Zod v4. DTOs are Zod schemas + `z.infer` types; validation runs automatically in the controller wrapper (`validateBody` / `validateQuery`).
- **ORM:** Drizzle ORM + Cloudflare D1 (SQLite). Migrations via `drizzle-kit generate` + `wrangler d1 migrations apply`.
- **Docs:** OpenAPI routes are auto-registered from decorator options (`registerRoutesForDocs`); served at `/docs.json` via `setupOpenApi` (wired up in `AppModule.setupDocs()`).

## Commands

| Task | Command |
|---|---|
| Dev (remote bindings) | `bun run dev` |
| Dev (local D1) | `bun run dev:local` |
| Type check | `bun run check` (`tsc --noEmit`) |
| Generate migration | `bun run db:generate` |
| Apply migrations (local / remote) | `bun run db:migrate` / `bun run db:migrate:remote` |
| Regenerate binding types | `bun run cf-typegen` → `worker-configuration.d.ts` |

## Database convention (`src/db/`)

### Schema — `src/db/schema/{domain}.schema.ts`

One file per domain; a single domain file may hold **multiple tables**. Export the table plus inferred row types:

```ts
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
    id: integer().primaryKey({ autoIncrement: true }),
    email: text("email").notNull().unique(),
    name: text("name").notNull(),
    role: text("role").notNull().default("user"),
});

export type UserRow = typeof usersTable.$inferSelect;
export type NewUserRow = typeof usersTable.$inferInsert;
```

### Contracts (repositories) — `src/db/contracts/{domain}.repository.ts`

Hexagonal-architecture rule: services never talk to Drizzle directly; all persistence goes through a **repository contract** that extends the generic, table-driven `BaseRepository`:

```ts
import { eq } from "drizzle-orm";
import { usersTable, type NewUserRow, type UserRow } from "../schema/users.schema";
import { BaseRepository, type D1Client } from "./base.repository";

export type UserRecord = UserRow;
export type NewUserRecord = NewUserRow;

export class UserRepository extends BaseRepository<typeof usersTable> {
    constructor(db: D1Client) {
        super(db, usersTable, usersTable.id);
    }

    async findByEmail(email: string): Promise<UserRecord | null> {
        return await this.findOne({ where: eq(usersTable.email, email) });
    }
}
```

`BaseRepository` provides CRUD (`create`, `update`, `delete`) plus query-descriptor reads (`findOne` / `findAll` / `findWithPagination` accepting `{ select, where, orderBy, limit, skip, page }`). Add only domain-specific finders here; keep generic reads in the base.

The DB client is a module-scope static (`src/db/db-client.ts`): `DBClient.client` — a `DrizzleD1Database` built from `cloudflare:workers` `env.DB`. Controllers/services construct repositories with it.

After schema changes: run `bun run db:generate`, then apply migrations.

## Environment (`src/common/constants/env.ts`)

The `EnvironmentVariables` interface types every secret/var used through Hono's `env(c)`:

```ts
interface EnvironmentVariables {
    DATABASE_URL: string
    JWT_SECRET: string
}
```

**Whenever you add a new environment variable, add its type to this interface too.** Then read it via:

- `Environment.getByContext(key, c)` — optional read inside a request context.
- `Environment.requireByContext(key, c)` — throws if missing.
- Worker module-scope bindings (e.g. `env.MAILCHANNELS_ENDPOINT`, `env.DB`) come from `cloudflare:workers` `env` — they are typed via `wrangler.jsonc` bindings + `bun run cf-typegen`, not through this interface.

## Constants (`src/common/constants/index.ts`)

Use this file for shared fixed values/strings (route paths, header names, default messages, enum-like literals) instead of hardcoding text inline. Import from `common/constants` in services, controllers, and middleware.

## Validation (`src/common/helpers/validation.helper.ts`)

Do not call this manually in handlers — the `IController` route wrapper already runs `validateBody` / `validateQuery` against the Zod schema from the decorator options and short-circuits with `400 BAD_REQUEST` (formatted Zod issues) on failure. Use `validateWithSchema` directly only for ad-hoc validation outside the request pipeline (e.g. inside a service parsing a queue payload).

## OpenAPI (`src/common/openapi/`)

Docs are generated automatically from decorator options — never hand-write OpenAPI:

- `registerRoutesForDocs` is called by `IController` with each route's `{ method, path, options }`; `summary`, `tags`, `body`, `query` feed the doc.
- `schema.generator.ts` converts Zod schemas to JSON Schema into `components.schemas`.
- Enable the endpoint by calling `setupOpenApi(this.app, "/docs")` in `AppModule.setupDocs()` (invoked from the constructor); serves the doc at `/docs.json` (no HTML UI is hosted).
- Describe DTO fields with `.describe("...")` so they show up in the generated docs.

## User type (`src/common/interfaces/user.interface.ts`)

The canonical JWT/auth user shape shared across `JwtHelper`, `AuthorizationMiddleware`, `AppEnv.Variables.user`, and `checkPermission`:

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

The `AuthorizationMiddleware` uses this helper to verify Bearer tokens and set `c.set("user", payload)`; `JwtHelper` is HS256 by default.

## Email (`src/common/email/email.service.ts`)

`EmailService` is a static-class helper (mirrors `ResponseHelper` style). It renders **MJML at runtime** (`mjml-browser`) and sends via MailChannels' transactional HTTP API (no API key; authenticated by the Worker).

```ts
await EmailService.send({
    to: "user@example.com",
    subject: "Welcome",
    template: "base",                       // optional, defaults to "base"
    variables: { name: "John" },             // {{name}} escaped, {{{name}}} raw
});
```

To add a template: create `xxx.mjml`, import it in `email.service.ts`, and register it in the `templates` map — the key becomes selectable via `EmailTemplate` type automatically.

## API feature convention (`src/api/{feature}/`)

Each feature is a folder under `src/api/`:

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
export class UserService extends UserRepository {
    constructor(db: D1Client) {
        super(db);
    }
}
```

### Controller

Extends `IController`; decorator options carry validation schema, OpenAPI metadata, and permissions. Handlers receive `(c: HandlerContext, body, query)` — `body`/`query` types are inferred from the Zod schema in the decorator. Always respond via `ResponseHelper`:

```ts
export class UserController extends IController {
    static basePath?: string | undefined = "/users";
    private userService = new UserService(DBClient.client);

    constructor(app: Hono<AppEnv>) {
        super(app);
    }

    @Post("/", {
        body: CreateUserSchema,
        summary: "Create a User",
        tags: ["Users"],
        permission: { role: "admin", required: ["user.manage"] },
    })
    async create(c: HandlerContext, payload: CreateUserDto) {
        const user = await this.userService.create(payload);
        return ResponseHelper.success(user, { status: 201 });
    }

    @Get("/:id", {
        summary: "Get user By id",
        tags: ["Users"],
        permission: { role: "user", required: ["user.read"] },
    })
    async getById(c: HandlerContext) {
        const user = await this.userService.findOne({ where: eq(usersTable.id, Number(c.req.param("id"))) });
        return ResponseHelper.success(user);
    }
}
```

Available decorators: `@Get`, `@Post`, `@Put`, `@Patch`, `@Delete` — signature `(path, options?)` with `options: { body?, query?, summary?, tags?, permission? }`.

### Module

Extends `IModule`, passes the controller's `basePath` to `super`, and instantiates the controller with the sub-app:

```ts
export class UserModule extends IModule {
    constructor() {
        super(UserController.basePath);
        new UserController(this.app);
    }
}
```

### Registering a feature

1. Create the folder `src/api/{feature}/` with module/controller/service (+ dto).
2. Add the module class to the `modules` array in `src/app.module.ts` — `AppModule.routes()` mounts each via `app.route("/", module.geApp())`.

## Permissions & roles

Defined per route in decorator `permission` (`RoutePermission`):

```ts
permission: {
    role: "admin",              // must match the JWT `role` claim
    required: ["user.manage"],  // permissions the JWT user must hold
}
```

Flow:
1. `AuthorizationMiddleware` (registered in `MiddlewareRegistry` on `AuthorizationMiddleware.protectedPath`, currently `api/*`) verifies the Bearer JWT and sets `c.get("user")`.
2. `IController`'s route wrapper calls `checkPermission` before the handler: role mismatch or any missing permission → `403 FORBIDDEN` via `ResponseHelper.error`.
3. A user permission of `"*"` grants everything.

Note: authorization middleware is currently **commented out** in `MiddlewareRegistry.register()` — uncomment to enforce auth; routes without `permission` options stay public.

## Response convention

Never return raw `Response.json(...)` from handlers. Use `ResponseHelper.success(data, { status?, message? })` and `ResponseHelper.error(message, { status, code })` with codes from `Code` (`AUTH_FAILED | FORBIDDEN | NOT_FOUND | BAD_REQUEST | SERVER_ERROR`). Global 404/500 handling lives in `AppModule.notFound()/onError()`.

## Queue & schedule

Worker entry (`src/main.ts`) forwards `scheduled` and `queue` handlers to `AppModule`, which delegates to `ScheduleProcessor` and `QueueProcessor` (`src/common/schedule|queue/`). Queue jobs are typed via `QueueJob` and bound as `JOB_QUEUE` (`AppEnv.Bindings`). Add new job kinds there, not ad-hoc.

## Misc rules

- All Hono generics use `AppEnv` (`src/common/interfaces/app-env.interface.ts`) — extend `Bindings`/`Variables` there when adding D1/Queue/vars usage.
- Middleware classes extend `Middleware` (`middleware.interface.ts`) and expose the handler as an arrow-function property `use = async (c, next) => {...}` so `this` stays bound when registered via `app.use(path, mw.use)`.
- Naming: files are `dot.case` (`user.controller.ts`, `base.mjml`); classes are PascalCase; tables are `{name}Table`.
