import type { User } from "./user.interface";
import type { QueueJob } from "../queue/queue.processor";

export type AppEnv = {
    Bindings: {
        DB: D1Database;
        JOB_QUEUE: Queue<QueueJob>;
    };
    Variables: {
        user: User;
    };
};
