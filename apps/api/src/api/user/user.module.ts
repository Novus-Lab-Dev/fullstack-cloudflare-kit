import { Hono } from "hono";
import type { AppEnv } from "../../common/interfaces/app-env.interface";
import { UserController } from "./user.controller";
import { IModule } from "../../common/interfaces/module";

export class UserModule extends IModule {
    constructor() {
        super(UserController.basePath);
        new UserController(this.app);
    }
}
