import { Hono } from "hono";
import { LoggerMiddleware } from "./logger.middleware";

export class Middleware {
    constructor(app: Hono) {
        this.init(app);
    }


    init(app: Hono) {
        const [logger] = [
            new LoggerMiddleware()
        ];
        app.use("*", logger.use);
    }
}