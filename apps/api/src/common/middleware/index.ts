import { Hono } from "hono";
import { LoggerMiddleware } from "./logger.middleware";
import { AuthorizationMiddleware } from "./authorization.midleware";

export class Middleware {
    constructor(app: Hono) {
        this.init(app);
    }


    init(app: Hono) {
        const [logger,
            authorization,
        ] = [
                new LoggerMiddleware(),
                new AuthorizationMiddleware(),
            ];
        app.use("*", logger.use);

        app.on("*",
            AuthorizationMiddleware.prefix,
            authorization.use
        );
    }
}