import { Hono } from "hono";
import type { Context } from "hono";
import type { AppEnv } from "./common/interfaces/app-env.interface";
import { MiddlewareRegistry } from "./common/middleware";
import { setupOpenApi } from "./common/openapi/openapi.service";
import { ResponseHelper } from "./common/helpers/response.helper";
import { UserModule } from "./api/user/user.module";
import { ScheduleProcessor } from "./common/schedule/schedule.processor";
import { QueueProcessor, type QueueJob } from "./common/queue/queue.processor";


export class AppModule {
    modules = [
        UserModule
    ];

    app: Hono<AppEnv>
    scheduleProcessor = new ScheduleProcessor();
    queueProcessor = new QueueProcessor();

    constructor(app: Hono<AppEnv>) {
        this.app = app;
        this.useMiddlewares();
        this.routes();
        this.setupDocs();
        this.notFound();
        this.onError();
    }

    useMiddlewares() {
        new MiddlewareRegistry(this.app)
    }

    routes() {
        this.modules.forEach(module => {
            const appModule = new module();
            this.app.route("/", appModule.geApp())
        });
    }

    setupDocs() {
        setupOpenApi(this.app, "/docs");
    }

    notFound() {
        this.app.notFound((c: Context<AppEnv>) =>
            ResponseHelper.error(`Route ${c.req.method} ${c.req.path} not found`, {
                status: 404,
                code: "NOT_FOUND",
            })
        );
    }

    onError() {
        this.app.onError((err: Error, c: Context<AppEnv>) => {
            console.error(err);
            return ResponseHelper.error(err.message || "Internal Server Error", {
                status: 500,
                code: "SERVER_ERROR",
            });
        });
    }

    scheduled(event: ScheduledEvent, env: AppEnv["Bindings"], ctx: ExecutionContext) {
        this.scheduleProcessor.process(event, env, ctx);
    }

    queue(batch: MessageBatch<QueueJob>, env: AppEnv["Bindings"], ctx: ExecutionContext) {
        this.queueProcessor.process(batch, env, ctx);
    }
}

