import type { AppEnv } from "../interfaces/app-env.interface";

type QueueEnv = AppEnv["Bindings"];

// --- Job payload contracts shared by producer and consumer ---

export type TelemetrySyncJob = { type: "telemetry.sync"; source: string };
export type SessionCleanupJob = { type: "session.cleanup" };
export type WeeklyReportJob = { type: "report.weekly" };

export type QueueJob = TelemetrySyncJob | SessionCleanupJob | WeeklyReportJob;

export class QueueProcessor {
    process(batch: MessageBatch<QueueJob>, env: QueueEnv, ctx: ExecutionContext) {
        for (const message of batch.messages) {
            ctx.waitUntil(this.handleMessage(message, env));
        }
    }

    private async handleMessage(message: Message<QueueJob>, env: QueueEnv) {
        const { body } = message;
        console.log(`Processing job ${message.id} [${body.type}] (attempt ${message.attempts})`);

        try {
            switch (body.type) {
                case "telemetry.sync":
                    await this.syncTelemetry(env, body.source);
                    break;

                case "session.cleanup":
                    await this.cleanExpiredSessions(env);
                    break;

                case "report.weekly":
                    await this.sendWeeklyReport(env);
                    break;

                default:
                    console.warn(`Unrecognized job type received: ${(body as { type: string }).type}`);
            }

            message.ack();
        } catch (err) {
            console.error(`Job ${message.id} failed, will retry:`, err);
            message.retry();
        }
    }

    private async syncTelemetry(env: QueueEnv, source: string) {
        // TODO: implement telemetry sync
    }

    private async cleanExpiredSessions(env: QueueEnv) {
        // TODO: implement session cleanup
    }

    private async sendWeeklyReport(env: QueueEnv) {
        // TODO: implement weekly report
    }
}
