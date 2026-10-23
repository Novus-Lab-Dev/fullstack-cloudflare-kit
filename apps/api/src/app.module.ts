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
        this.app.get('/api', (c) => c.text('Hello API!'));
    }

    notFound() { }


    onError() { }
}

