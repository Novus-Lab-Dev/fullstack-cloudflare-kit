import { Context, Next } from "hono";
import { Middleware } from "./middleware.interface";
import { JwtHelper } from "../auth/jwt.helper";


export class AuthorizationMiddleware extends Middleware {
    static protectedPath = "api/*";
    protected helper = new JwtHelper();

    use = async (c: Context, next: Next) => {
        console.log("AuthorizationMiddleware");
        const token = this.getToken(c);

        if (!token) {
            throw new Error("Authorization header is missing");
        }


        if (!this.helper.verify(token, c)) {
            throw new Error("Invalid token");
        }

        const payload = this.helper.verify(token, c);
        c.set("user", payload)

        await next();
    }

    getToken(c: Context): string | undefined {
        const bearerToken = c.req.header("Authorization") || c.req.header("authorization");
        return bearerToken?.split(" ")[1];
    }
}
