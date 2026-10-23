import type { Hono } from "hono";
import type { AppEnv } from "../../common/interfaces/app-env.interface";
import { HandlerContext, IController, Post } from "../../common/interfaces/controller";
import { DbClient } from "../../db/db-client";
import { CreateUserSchema } from "./dto/user.dto";
import { UserService } from "./user.service";

export class UserController extends IController {
    private userService = new UserService(DbClient.client);

    constructor(app: Hono<AppEnv>) {
        super(app, "/users");
    }

    @Post("/", {
        body: CreateUserSchema,
        summary: "Create a User",
        tags: ["Users"]
    })
    async create(c: HandlerContext) {
        const user = await this.userService.create(
            {
                email: "saf",
                role: "admin",
                name: "Demo",
            }
        )
    }
}
