import { Hono } from "hono";
import { LoggerMiddleware } from "./logger.middleware";
import { AuthorizationMiddleware } from "./authorization.middleware";

export class MiddlewareRegistry {
    constructor(app: Hono) {
        this.register(app);
    }


    register(app: Hono) {
        const [
            loggerMiddleware,
            authorizationMiddleware,
        ] = [
                new LoggerMiddleware(),
                new AuthorizationMiddleware(),
            ];
        app.use("*", loggerMiddleware.use);

        app.on("*",
            AuthorizationMiddleware.protectedPaths,
            authorizationMiddleware.use
        );
    }
}