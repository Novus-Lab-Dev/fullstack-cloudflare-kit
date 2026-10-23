import { Hono } from "hono";
import { UserController } from "./user.controller";

export class UserModule {

    constructor(app: Hono) {
        this.register(app);
    }

    register(app: Hono) {
        new UserController(app);
    }
}