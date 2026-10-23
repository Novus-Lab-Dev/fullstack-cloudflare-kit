import { Hono } from "hono";
import { IController } from "../../common/interfaces/controller";

export class UserController extends IController {
    
    
    get() {
        return "User Controller";
    }
}