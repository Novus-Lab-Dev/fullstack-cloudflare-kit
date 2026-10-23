import type { z } from "zod";
import type { Context } from "hono";
import type { AppEnv } from "../interfaces/app-env.interface";
import { ResponseHelper } from "./response.helper";

export type ValidateResult<T> =
    | { valid: true; data: T }
    | { valid: false; response: Response };

function formatErrors(error: z.ZodError): string {
    return error.issues.map(e => `${e.path.join(".")}: ${e.message}`).join("; ");
}

export function validateWithSchema<T>(schema: z.ZodType<T>, data: unknown): ValidateResult<T> {
    const result = schema.safeParse(data);
    if (!result.success) {
        return { valid: false, response: ResponseHelper.error(formatErrors(result.error), { status: 400, code: "BAD_REQUEST" }) };
    }
    return { valid: true, data: result.data };
}

export async function validateBody<T>(c: Context<AppEnv>, schema: z.ZodType<T>): Promise<ValidateResult<T>> {
    try {
        const body = await c.req.json();
        return validateWithSchema(schema, body);
    } catch {
        return { valid: false, response: ResponseHelper.error("Invalid JSON body", { status: 400, code: "BAD_REQUEST" }) };
    }
}

export function validateQuery<T>(c: Context<AppEnv>, schema: z.ZodType<T>): ValidateResult<T> {
    const query = c.req.query();
    return validateWithSchema(schema, query);
}
