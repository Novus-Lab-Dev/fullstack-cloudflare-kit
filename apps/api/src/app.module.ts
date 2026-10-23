import { Hono } from "hono";
import { MiddlewareRegistry } from "./common/middleware";

export class AppModule {
    app: Hono
    constructor(app: Hono) {
        this.app = app;
        this.useMiddlewares();
        this.routes();
        this.notFound();
        this.onError();
    }

    useMiddlewares() {
        new MiddlewareRegistry(this.app)
    }

    routes() {
        this.app.get('/', (c) => c.text('Hello World!'));
    }

    notFound() { }


    onError() { }
}

