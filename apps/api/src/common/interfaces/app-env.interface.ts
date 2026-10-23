import type { User } from "./user.interface";

export type AppEnv = {
    Bindings: {
        DB: D1Database;
    };
    Variables: {
        user: User;
    };
};
