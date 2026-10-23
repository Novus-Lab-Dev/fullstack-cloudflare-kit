import { Hono } from "hono";
import type { AppEnv } from "../interfaces/app-env.interface";
import { LoggerMiddleware } from "./logger.middleware";
import { AuthorizationMiddleware } from "./authorization.middleware";

export class MiddlewareRegistry {
    constructor(app: Hono<AppEnv>) {
        this.register(app);
    }

    register(app: Hono<AppEnv>) {
        const [
            loggerMiddleware,
            authorizationMiddleware,
        ] = [
                new LoggerMiddleware(),
                new AuthorizationMiddleware(),
            ];

        app.use("*", loggerMiddleware.use); // logger
        // app.use(AuthorizationMiddleware.protectedPath, authorizationMiddleware.use); //authorization
    }
}