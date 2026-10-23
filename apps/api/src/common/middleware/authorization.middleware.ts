import { Context, Next } from "hono";
import { Middleware } from "./middleware.interface";
import { JwtHelper } from "../auth/jwt.helper";
import { AppEnv } from "../interfaces/app-env.interface";
import type { User } from "../interfaces/user.interface";


export class AuthorizationMiddleware extends Middleware {
    static protectedPath = "api/*";
    protected helper = new JwtHelper();

    use = async (c: Context<AppEnv>, next: Next) => {
        console.log("AuthorizationMiddleware");
        const token = this.getToken(c);

        if (!token) {
            throw new Error("Authorization header is missing");
        }

        let payload: User;
        try {
            payload = await this.helper.verify(token, c);
        } catch {
            throw new Error("Invalid token");
        }

        c.set("user", payload);

        await next();
    }

    getToken(c: Context): string | undefined {
        const bearerToken = c.req.header("Authorization") || c.req.header("authorization");
        return bearerToken?.split(" ")[1];
    }
}
