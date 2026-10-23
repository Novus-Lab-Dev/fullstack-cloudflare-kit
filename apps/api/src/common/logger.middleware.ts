import { Context, Next } from 'hono'
import { logger } from 'hono/logger'
import { Middleware } from './interfaces/middleware.interface';


export class LoggerMiddleware extends Middleware {

    use = async (c: Context, next: Next) => {
        await logger()(c, next);
    }
}