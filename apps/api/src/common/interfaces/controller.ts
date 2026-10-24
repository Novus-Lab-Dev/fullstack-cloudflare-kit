import { Hono } from "hono";
import type { Context } from "hono";
import type { z } from "zod";
import type { AppEnv } from "./app-env.interface";
import { validateBody, validateQuery } from "../helpers/validation.helper";
import { ResponseHelper } from "../helpers/response.helper";
import type { User } from "./user.interface";
import { registerRoutesForDocs } from "../openapi/openapi.service";

// --- Route options with zod schemas ---

export type RoutePermission = {
    /** Role required to access the route (must match the JWT `role` claim). */
    role?: string;
    /** Permissions the user must hold. `"*"` in the user's permissions grants everything. */
    required?: string[];
};

export type RouteSchema = {
    body?: z.ZodType<any>;
    query?: z.ZodType<any>;
    summary?: string;
    tags?: string[];
    permission?: RoutePermission;
};
export type RouteOptions = RouteSchema;
export type HandlerContext = Context<AppEnv>;

// --- Handler payload types inferred from the schema passed to the decorator ---

type InferBody<S> = S extends { body: z.ZodType<infer B> } ? B : never;
type InferQuery<S> = S extends { query: z.ZodType<infer Q> } ? Q : never;

export type HandlerPayload<S extends RouteSchema = RouteSchema> = {
    c: HandlerContext;
    body: InferBody<S>;
    query: InferQuery<S>;
};

type Route<S extends RouteSchema = RouteSchema> = {
    method: "get" | "post" | "put" | "patch" | "delete";
    path: string;
    handler: (c: HandlerContext, body: InferBody<S>, query: InferQuery<S>) => any;
    options?: S;
};

type AnyRoute = Route<any>;

function checkPermission(permission: RoutePermission, user: User | undefined): string | null {
    if (!user) return "Missing authorization";
    if (permission.role && user.role !== permission.role) return `Requires role "${permission.role}"`;

    const granted = user.permissions ?? [];
    const missing = (permission.required ?? []).filter(p => !granted.includes("*") && !granted.includes(p));
    return missing.length ? `Missing permissions: ${missing.join(", ")}` : null;
}

function addToRoutes(target: object, route: AnyRoute) {
    const cls = target.constructor as { routes?: AnyRoute[] };
    (cls.routes ??= []).push(route);
}

// --- Route decorators ---

function defineRoute<S extends RouteSchema>(method: Route["method"], path: string, options?: S) {
    return (target: object, _key: string, desc: PropertyDescriptor) => {
        addToRoutes(target, { method, path, handler: desc.value, options });
    };
}

export function Get(path: string, options?: RouteOptions) {
    return defineRoute("get", path, options);
}

export function Post(path: string, options?: RouteOptions) {
    return defineRoute("post", path, options);
}

export function Put(path: string, options?: RouteOptions) {
    return defineRoute("put", path, options);
}

export function Patch(path: string, options?: RouteOptions) {
    return defineRoute("patch", path, options);
}

export function Delete(path: string, options?: RouteOptions) {
    return defineRoute("delete", path, options);
}

// --- Base Controller (auto-validates via zod) ---

export class IController {
    static basePath?: string;

    constructor(protected readonly app: Hono<AppEnv>, private readonly prefix: string = "") {
        const basePath = (this.constructor as typeof IController).basePath ?? "";
        const routes: AnyRoute[] = (this.constructor as { routes?: AnyRoute[] }).routes ?? [];

        // Docs must show the effective URL: IModule mounts this sub-app with
        // Hono.basePath(basePath), so prefix it here for the OpenAPI spec only.
        registerRoutesForDocs(
            routes.map(({ method, path, options }) => ({
                method,
                path: `${basePath}${this.prefix}${path}`.replace(/\/+$/, "") || "/",
                options,
            }))
        );

        for (const { method, path, handler, options } of routes) {
            const fullPath = `${this.prefix}${path}`.replace(/\/+$/, "") || "/";
            const bound = handler.bind(this);

            const wrapped = async (c: Context<AppEnv>) => {
                if (options?.permission) {
                    const denial = checkPermission(options.permission, c.get("user"));
                    if (denial) {
                        return ResponseHelper.error(denial, { status: 403, code: "FORBIDDEN" });
                    }
                }

                let body: unknown;
                let query: unknown;

                if (options?.body) {
                    const result = await validateBody(c, options.body);
                    if (!result.valid) return result.response;
                    body = result.data;
                }

                if (options?.query) {
                    const result = validateQuery(c, options.query);
                    if (!result.valid) return result.response;
                    query = result.data;
                }

                return bound(c, body, query);
            };

            this.app[method](fullPath, wrapped);
        }
    }
}
