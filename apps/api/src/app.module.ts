import { Hono } from "hono";
import type { AppEnv } from "./common/interfaces/app-env.interface";
import { MiddlewareRegistry } from "./common/middleware";
import { UserModule } from "./api/user/user.module";


export class AppModule {
    modules = [
        UserModule
    ];

    app: Hono<AppEnv>
    constructor(app: Hono<AppEnv>) {
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
        this.modules.forEach(module => {
            new module(this.app);
        });
    }

    notFound() { }
    onError() { }
}

