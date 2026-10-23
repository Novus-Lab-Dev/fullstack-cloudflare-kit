import { Context, Next } from 'hono';

export abstract class Middleware {
    abstract use(c: Context, next: Next): Promise<void>;
}