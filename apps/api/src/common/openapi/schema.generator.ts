import { z } from "zod";

export function schemaToJsonSchema(schema: z.ZodType<any>): Record<string, any> {
    return z.toJSONSchema(schema) as Record<string, any>;
}
