import type { Hono, Context } from "hono";
import { IController, Get, Post, Delete } from "../../common/interfaces/controller";
import type { AppEnv } from "../../common/interfaces/app-env.interface";
import type { User } from "../../common/interfaces/user.interface";
import { ResponseHelper } from "../../common/helpers/response.helper";
import { UserService } from "./user.service";

export class UserController extends IController {
    private userService = new UserService();

    constructor(app: Hono<AppEnv>) {
        console.log("user controller init")
        super(app, "/users");
    }

    @Get("/")
    async getAll(c: Context<AppEnv>) {
        const users = this.userService.findAll();
        return ResponseHelper.success(users);
    }

    @Get("/:sub")
    getBySub(c: Context<AppEnv>) {
        const user = this.userService.findBySub(c.req.param("sub") ?? "");
        if (!user) {
            return ResponseHelper.error("User not found", { status: 404, code: "NOT_FOUND" });
        }
        return ResponseHelper.success(user);
    }

    @Post("/")
    async create(c: Context<AppEnv>) {
        const user = await c.req.json<User>();
        return ResponseHelper.success(this.userService.create(user), { status: 201 });
    }

    @Delete("/:sub")
    remove(c: Context<AppEnv>) {
        return ResponseHelper.success(this.userService.remove(c.req.param("sub") ?? ""));
    }
}
