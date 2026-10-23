import { Hono } from "hono";

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
        this.app.use('*', async (c, next) => {
            console.log('Middleware executed');
            await next();
        });
    }

    routes() {
        this.app.get('/', (c) => c.text('Hello World!'));
    }

    notFound() { }


    onError() { }
}

