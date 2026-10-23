import type { Hono } from "hono";
import type { AppEnv } from "../../common/interfaces/app-env.interface";
import { UserController } from "./user.controller";

export class UserModule {
    constructor(app: Hono<AppEnv>) {
        console.log("User Module init")
        new UserController(app);
    }
}
