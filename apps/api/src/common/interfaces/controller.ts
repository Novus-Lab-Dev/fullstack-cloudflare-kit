import { Hono } from "hono";
import type { Context } from "hono";
import type { AppEnv } from "./app-env.interface";

type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

type RouteHandler = (c: Context<AppEnv>) => any;

interface RouteDefinition {
    method: HttpMethod;
    path: string;
    handler: RouteHandler;
}

const ROUTES_KEY = Symbol("routes");

function defineRoute(method: HttpMethod, path: string): MethodDecorator {
    return (target, _propertyKey, descriptor) => {
        const routes: RouteDefinition[] = ((target as any).constructor[ROUTES_KEY] ??= []);
        routes.push({ method, path, handler: descriptor.value as RouteHandler });
    };
}

export const Get = (path: string) => defineRoute("get", path);
export const Post = (path: string) => defineRoute("post", path);
export const Put = (path: string) => defineRoute("put", path);
export const Patch = (path: string) => defineRoute("patch", path);
export const Delete = (path: string) => defineRoute("delete", path);

export class IController {
    constructor(protected readonly app: Hono<AppEnv>, private readonly prefix: string) {
        const routes: RouteDefinition[] = (new.target as any)[ROUTES_KEY] ?? [];
        for (const { method, path, handler } of routes) {
            this.app[method](`${this.prefix}${path}`, handler.bind(this) as any);
        }
    }
}
