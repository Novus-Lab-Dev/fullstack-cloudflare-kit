import { Context, Next } from "hono";
import { Middleware } from "./middleware.interface";


export class AuthorizationMiddleware extends Middleware {
    static protectedPath = "api/*";

    use = async (c: Context, next: Next) => {
        console.log("AuthorizationMiddleware");
        await next();
    }
}
