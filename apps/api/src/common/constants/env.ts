import { Context, Hono } from 'hono'
import { env } from 'hono/adapter'

interface EnvironmentVariables {
    DATABASE_URL: string
    JWT_SECRET: string
}


class Env {
    env: EnvironmentVariables
    constructor(c: Context) {
        this.env = env(c)
    }

    get(key: keyof EnvironmentVariables): string | undefined {
        return this.env[key]
    }


    static getByContext(key: keyof EnvironmentVariables, c: Context,): string | undefined {
        return env(c)[key]
    }
}