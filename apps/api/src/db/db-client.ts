import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import type { D1Client } from "./contracts/base.repository";


export class DBClient {
    static readonly client: D1Client = drizzle(env.DB);
}
