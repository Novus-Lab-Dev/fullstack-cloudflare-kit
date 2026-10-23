import { Context, Next } from "hono";
import { Middleware } from "./middleware.interface";


export class AuthorizationMiddleware extends Middleware {
    static protectedPaths = ["/api/*", "/protected/*"];

    use = async (c: Context, next: Next) => {
        await next();
    }
}
