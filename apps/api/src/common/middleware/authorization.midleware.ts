import { Context } from "hono";
import { Middleware } from "./middleware.interface";
import { bearerAuth } from 'hono/bearer-auth'


export class AuthorizationMiddleware extends Middleware {
    static prefix: string[] = ["/api"];

    use(c: Context, next: () => Promise<void>) {
        return next();
    }
}