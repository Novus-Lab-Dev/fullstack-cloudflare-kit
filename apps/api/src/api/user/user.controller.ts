import type { Hono } from "hono";
import { ResponseHelper } from "../../common/helpers/response.helper";
import type { AppEnv } from "../../common/interfaces/app-env.interface";
import { HandlerContext, IController, Post } from "../../common/interfaces/controller";
import { DBClient } from "../../db/db-client";
import { CreateUserDto, CreateUserSchema } from "./dto/user.dto";
import { UserService } from "./user.service";

export class UserController extends IController {
    private userService = new UserService(DBClient.client);

    constructor(app: Hono<AppEnv>) {
        super(app, "/users");
    }

    @Post("/", {
        body: CreateUserSchema,
        summary: "Create a User",
        tags: ["Users"]
    })
    async create(c: HandlerContext, payload: CreateUserDto) {
        const user = await this.userService.create(payload);
        return ResponseHelper.success(user, { status: 201 });
    }
}
