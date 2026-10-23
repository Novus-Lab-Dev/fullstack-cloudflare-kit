import { Hono } from "hono";
import type { AppEnv } from "../../common/interfaces/app-env.interface";
import { UserController } from "./user.controller";

export class UserModule {
    protected app = new Hono<AppEnv>().basePath("/users");
    constructor() {
        new UserController(this.app);
    }

    public geApp() {
        return this.app;
    }
}
