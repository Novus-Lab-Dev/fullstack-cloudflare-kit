import { Context, Next } from 'hono'
import { logger } from 'hono/logger'


export class LoggerMiddleware {

    use = async (c: Context, next: Next) => {
        await logger()(c, next);
    }
}