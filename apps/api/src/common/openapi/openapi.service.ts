import type { Hono } from "hono";
import type { z } from "zod";
import type { AppEnv } from "../interfaces/app-env.interface";
import type { RouteOptions } from "../interfaces/controller";
import { schemaToJsonSchema } from "./schema.generator";

type RouteMeta = {
    method: string;
    path: string;
    options?: RouteOptions;
};

type OpenApiDoc = {
    openapi: string;
    info: { title: string; version: string };
    paths: Record<string, any>;
    components: { schemas: Record<string, any> };
};

const registry: { controllers: RouteMeta[][] } = { controllers: [] };

export function registerRoutesForDocs(routes: RouteMeta[]) {
    registry.controllers.push(routes);
}

export function buildOpenApiDoc(info = { title: "SMS API", version: "1.0.0" }): OpenApiDoc {
    const paths: Record<string, any> = {};
    const schemas: Record<string, any> = {};

    for (const routes of registry.controllers) {
        for (const { method, path, options } of routes) {
            if (!paths[path]) paths[path] = {};

            const operation: any = {};
            if (options?.summary) operation.summary = options.summary;
            if (options?.tags) operation.tags = options.tags;
            operation.responses = { "200": { description: "Successful response" } };

            // Body schema → requestBody
            if (options?.body) {
                const jsonSchema = schemaToJsonSchema(options.body);
                const schemaName = `${path.replace(/[^a-z]/gi, "_")}_${method}_body`;
                schemas[schemaName] = jsonSchema;
                operation.requestBody = {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: `#/components/schemas/${schemaName}` },
                        },
                    },
                };
            }

            // Query schema → parameters
            if (options?.query) {
                const querySchema = schemaToJsonSchema(options.query);
                const params = Object.entries(querySchema.properties ?? {}).map(([name, prop]: [string, any]) => ({
                    name,
                    in: "query",
                    required: (querySchema.required ?? []).includes(name),
                    schema: { type: prop.type ?? "string", ...(prop.enum && { enum: prop.enum }) },
                    ...(prop.description && { description: prop.description }),
                }));
                operation.parameters = params;
            }

            paths[path][method] = operation;
        }
    }

    return {
        openapi: "3.0.3",
        info,
        paths,
        components: { schemas },
    };
}

export function setupOpenApi(app: Hono<AppEnv>, prefix = "/doc") {
    app.get(`${prefix}.json`, (c) => {
        const doc = buildOpenApiDoc();
        return c.json(doc);
    });
}
