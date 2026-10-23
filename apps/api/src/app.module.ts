import { Hono } from "hono";
import { LoggerMiddleware } from "./common/middleware/logger.middleware";
import { Middleware } from "./common/middleware";

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
        new Middleware(this.app)
    }

    routes() {
        this.app.get('/', (c) => c.text('Hello World!'));
    }

    notFound() { }


    onError() { }
}

