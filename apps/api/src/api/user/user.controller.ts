import type { Hono } from "hono";
import { ResponseHelper } from "../../common/helpers/response.helper";
import type { AppEnv } from "../../common/interfaces/app-env.interface";
import { Get, HandlerContext, IController, Post, Put } from "../../common/interfaces/controller";
import { DBClient } from "../../db/db-client";
import { CreateUserDto, CreateUserSchema } from "./dto/user.dto";
import { UserService } from "./user.service";
import { and, eq, isNotNull } from "drizzle-orm";
import { usersTable } from "../../db/schema/users.schema";

export class UserController extends IController {
    private userService = new UserService(DBClient.client);

    constructor(app: Hono<AppEnv>) {
        super(app);
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

    @Get("/", { summary: "Get all", tags: ["Users"] })
    async getAll() {
        const users = await this.userService.findAll({
            where: isNotNull(usersTable.name),
        })

        return ResponseHelper.success(users);
    }

    @Get("/:id", { summary: "Get user By id", tags: ["Users"] })
    async getById(c: HandlerContext) {
        if (!c.req.param("id")) {
            return ResponseHelper.error("Invalid id", { status: 400 });
        }
        const users = await this.userService.findOne({
            where: and(
                isNotNull(usersTable.name),
                eq(usersTable.id, Number(c.req.param("id"))),
            )
        })

        return ResponseHelper.success(users);
    }
}
