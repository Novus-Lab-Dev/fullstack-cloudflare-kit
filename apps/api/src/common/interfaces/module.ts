import { Hono } from "hono";
import type { AppEnv } from "./app-env.interface";

export class IModule {
    protected readonly app: Hono<AppEnv, any, any>;
    constructor(basePath?: string) {
        this.app = basePath
            ? new Hono<AppEnv>().basePath(basePath)
            : new Hono<AppEnv>();
    }

    public geApp() {
        return this.app;
    }
}
