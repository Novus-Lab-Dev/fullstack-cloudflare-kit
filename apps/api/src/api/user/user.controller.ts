import { Hono } from "hono";
import { IController } from "../../common/interfaces/controller";

export class UserController extends IController {

    get() {
        
        return "User Controller Get";
    }

    post() {
        return "User Controller Post";
    }
}