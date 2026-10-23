import type { Hono, Context } from "hono";
import { IController, Get, Post, Delete } from "../../common/interfaces/controller";
import type { AppEnv } from "../../common/interfaces/app-env.interface";
import { ResponseHelper } from "../../common/helpers/response.helper";
import { DbClient } from "../../db/db-client";
import { UserService } from "./user.service";
import { CreateUserSchema, ListUsersQuerySchema } from "./dto/user.dto";
import type { CreateUserDto, ListUsersQueryDto } from "./dto/user.dto";

export class UserController extends IController {
    private userService = new UserService(DbClient.client);

    constructor(app: Hono<AppEnv>) {
        super(app, "/users");
    }

    @Get("/", { query: ListUsersQuerySchema, summary: "List all users", tags: ["Users"] })
    async getAll(c: Context<AppEnv>, _body: any, query: ListUsersQueryDto) {
        const users = await this.userService.listUsers(query);
        return ResponseHelper.success(users, { message: `Page ${users.page}` });
    }

    @Get("/:sub", { summary: "Get user by subject", tags: ["Users"] })
    async getBySub(c: Context<AppEnv>) {
        const user = await this.userService.findBySub(c.req.param("sub") ?? "");
        if (!user) {
            return ResponseHelper.error("User not found", { status: 404, code: "NOT_FOUND" });
        }
        return ResponseHelper.success(user);
    }

    @Post("/", { body: CreateUserSchema, summary: "Create a new user", tags: ["Users"] })
    async create(c: Context<AppEnv>, body: CreateUserDto) {
        const user = await this.userService.createUser(body);
        return ResponseHelper.success(user, { status: 201 });
    }

    @Delete("/:sub", { summary: "Delete a user", tags: ["Users"] })
    async remove(c: Context<AppEnv>) {
        const result = await this.userService.removeUser(c.req.param("sub") ?? "");
        return ResponseHelper.success(result);
    }
}
