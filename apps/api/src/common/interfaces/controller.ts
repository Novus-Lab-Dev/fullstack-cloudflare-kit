import { Hono } from "hono";
import type { Context } from "hono";
import type { AppEnv } from "./app-env.interface";

// --- Route storage ---

type Route = {
    method: "get" | "post" | "put" | "patch" | "delete";
    path: string;
    handler: (c: Context<AppEnv>) => any;
};

// Helper: get or create the routes array on the controller class
function addToRoutes(target: object, route: Route) {
    const cls = target.constructor as { routes?: Route[] };
    (cls.routes ??= []).push(route);
}

// --- Decorators ---

export function Get(path: string) {
    return (target: object, _key: string, desc: PropertyDescriptor) => {
        addToRoutes(target, { method: "get", path, handler: desc.value });
    };
}

export function Post(path: string) {
    return (target: object, _key: string, desc: PropertyDescriptor) => {
        addToRoutes(target, { method: "post", path, handler: desc.value });
    };
}

export function Put(path: string) {
    return (target: object, _key: string, desc: PropertyDescriptor) => {
        addToRoutes(target, { method: "put", path, handler: desc.value });
    };
}

export function Delete(path: string) {
    return (target: object, _key: string, desc: PropertyDescriptor) => {
        addToRoutes(target, { method: "delete", path, handler: desc.value });
    };
}

// --- Base Controller ---

export class IController {
    constructor(protected readonly app: Hono<AppEnv>, private readonly prefix: string) {
        const routes: Route[] = (this.constructor as { routes?: Route[] }).routes ?? [];
        for (const { method, path, handler } of routes) {
            const fullPath = `${this.prefix}${path}`.replace(/\/+$/, "") || "/";
            this.app[method](fullPath, handler.bind(this));
        }
    }
}
