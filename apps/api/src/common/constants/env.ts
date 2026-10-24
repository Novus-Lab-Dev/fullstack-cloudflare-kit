import { Context } from 'hono'
import { env } from 'hono/adapter'

interface EnvironmentVariables {
    DATABASE_URL: string
    JWT_SECRET: string
    EMAIL_FROM: string
    EMAIL_FROM_NAME: string
    MAILCHANNELS_ENDPOINT: string
}


export class Environment {
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

    static requireByContext(key: keyof EnvironmentVariables, c: Context): string {
        const value = env(c)[key]
        if (value === undefined) {
            throw new Error(`Environment variable "${key}" is not set`)
        }
        return value
    }
}