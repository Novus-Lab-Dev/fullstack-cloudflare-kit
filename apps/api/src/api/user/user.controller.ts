import type { Hono, Context } from "hono";
import { IController, Get, Post, Delete } from "../../common/interfaces/controller";
import type { AppEnv } from "../../common/interfaces/app-env.interface";
import type { User } from "../../common/interfaces/user.interface";
import { UserService } from "./user.service";

export class UserController extends IController {
    private userService = new UserService();

    constructor(app: Hono<AppEnv>) {
        super(app, "/users");
    }

    @Get("/")
    getAll(c: Context<AppEnv>) {
        return c.json(this.userService.findAll());
    }

    @Get("/:sub")
    getBySub(c: Context<AppEnv>) {
        const user = this.userService.findBySub(c.req.param("sub") ?? "");
        return c.json(user ?? null, user ? 200 : 404);
    }

    @Post("/")
    async create(c: Context<AppEnv>) {
        const user = await c.req.json<User>();
        return c.json(this.userService.create(user), 201);
    }

    @Delete("/:sub")
    remove(c: Context<AppEnv>) {
        return c.json(this.userService.remove(c.req.param("sub") ?? ""));
    }
}
