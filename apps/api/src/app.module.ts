import { Hono } from "hono";
import { LoggerMiddleware } from "./common/logger.middleware";

export class AppModule {
    app: Hono
    constructor(app: Hono) {
        this.app = app;
        this.middleware();
        this.routes();
        this.notFound();
        this.onError();
    }

    middleware() {
        const [logger] = [
            new LoggerMiddleware()
        ];
        this.app.use("*", logger.use);
    }

    routes() {
        this.app.get('/', (c) => c.text('Hello World!'));
    }

    notFound() { }


    onError() { }
}

