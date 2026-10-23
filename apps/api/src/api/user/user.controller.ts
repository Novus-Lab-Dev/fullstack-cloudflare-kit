import type { Hono, Context } from "hono";
import { IController, Get, Post, Delete } from "../../common/interfaces/controller";
import type { AppEnv } from "../../common/interfaces/app-env.interface";
import { ResponseHelper } from "../../common/helpers/response.helper";
import { UserService } from "./user.service";
import { CreateUserSchema, ListUsersQuerySchema } from "./dto/user.dto";
import type { CreateUserDto, ListUsersQueryDto } from "./dto/user.dto";

export class UserController extends IController {
    private userService = new UserService();

    constructor(app: Hono<AppEnv>) {
        super(app, "/users");
    }

    @Get("/", { query: ListUsersQuerySchema, summary: "List all users", tags: ["Users"] })
    getAll(c: Context<AppEnv>, _body: any, query: ListUsersQueryDto) {
        const users = this.userService.findAll();
        return ResponseHelper.success(users, { message: `Page ${query.page ?? 1}` });
    }

    @Get("/:sub", { summary: "Get user by subject", tags: ["Users"] })
    getBySub(c: Context<AppEnv>) {
        const user = this.userService.findBySub(c.req.param("sub") ?? "");
        if (!user) {
            return ResponseHelper.error("User not found", { status: 404, code: "NOT_FOUND" });
        }
        return ResponseHelper.success(user);
    }

    @Post("/", { body: CreateUserSchema, summary: "Create a new user", tags: ["Users"] })
    create(c: Context<AppEnv>, body: CreateUserDto) {
        const user = this.userService.create(body as any);
        return ResponseHelper.success(user, { status: 201 });
    }

    @Delete("/:sub", { summary: "Delete a user", tags: ["Users"] })
    remove(c: Context<AppEnv>) {
        return ResponseHelper.success(this.userService.remove(c.req.param("sub") ?? ""));
    }
}
