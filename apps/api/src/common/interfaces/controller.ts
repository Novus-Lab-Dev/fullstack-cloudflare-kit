import { Hono } from "hono";
import type { Context } from "hono";
import type { z } from "zod";
import type { AppEnv } from "./app-env.interface";
import { validateBody, validateQuery } from "../helpers/validation.helper";
import type { ValidateResult } from "../helpers/validation.helper";
import { registerRoutesForDocs } from "../openapi/openapi.service";

// --- Route options with zod schemas ---

export type RouteOptions = {
    body?: z.ZodType<any>;
    query?: z.ZodType<any>;
    summary?: string;
    tags?: string[];
};
export type HandlerContext = Context<AppEnv>;

type Route = {
    method: "get" | "post" | "put" | "patch" | "delete";
    path: string;
    handler: (c: Context<AppEnv>, body?: any, query?: any) => any;
    options?: RouteOptions;
};

function addToRoutes(target: object, route: Route) {
    const cls = target.constructor as { routes?: Route[] };
    (cls.routes ??= []).push(route);
}

// --- Route decorators ---

function defineRoute(method: Route["method"], path: string, options?: RouteOptions) {
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
    constructor(protected readonly app: Hono<AppEnv>, private readonly prefix: string) {
        const routes: Route[] = (this.constructor as { routes?: Route[] }).routes ?? [];

        registerRoutesForDocs(
            routes.map(({ method, path, options }) => ({
                method,
                path: `${this.prefix}${path}`.replace(/\/+$/, "") || "/",
                options,
            }))
        );

        for (const { method, path, handler, options } of routes) {
            const fullPath = `${this.prefix}${path}`.replace(/\/+$/, "") || "/";
            const bound = handler.bind(this);

            const wrapped = async (c: Context<AppEnv>) => {
                let body: any;
                let query: any;

                if (options?.body) {
                    const result: ValidateResult<any> = await validateBody(c, options.body);
                    if (!result.valid) return result.response;
                    body = result.data;
                }

                if (options?.query) {
                    const result: ValidateResult<any> = validateQuery(c, options.query);
                    if (!result.valid) return result.response;
                    query = result.data;
                }

                return bound(c, body, query);
            };

            this.app[method](fullPath, wrapped);
        }
    }
}
