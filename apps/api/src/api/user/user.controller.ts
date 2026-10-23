import { Hono } from "hono";
import { IController } from "../../common/interfaces/controller";
import { UserService } from "./user.service";

const method = {

}

export class UserController extends IController {
    userService: UserService = new UserService();


    get(path: string, method: "get" | "post" | "delete" | "put" | "patch") {
        this.app[method](path, async (c) => {
            
        })
        return "User Controller Get";
    }

    post() {
        return "User Controller Post";
    }
}