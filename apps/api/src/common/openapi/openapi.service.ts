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

const SWAGGER_UI_CSS = "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css";
const SWAGGER_UI_JS = "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js";

// Minimal Swagger UI page (CDN assets) pointed at the JSON spec served below.
function swaggerHtml(specUrl: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>SMS API Docs</title>
    <link rel="stylesheet" href="${SWAGGER_UI_CSS}">
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="${SWAGGER_UI_JS}"></script>
    <script>
        SwaggerUIBundle({ url: "${specUrl}", dom_id: "#swagger-ui", deepLinking: true });
    </script>
</body>
</html>`;
}

export function setupOpenApi(app: Hono<AppEnv>, prefix = "/docs") {
    app.get(`${prefix}.json`, (c) => {
        const doc = buildOpenApiDoc();
        return c.json(doc);
    });

    app.get(prefix, (c) => c.html(swaggerHtml(`${prefix}.json`)));
}
