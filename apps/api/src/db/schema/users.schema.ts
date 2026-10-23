import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Dialect-neutral table definition (SQLite flavour for D1).
 * When swapping to another DB, only the adapter layer defines its own
 * table mapping — contracts and services stay untouched.
 */
export const usersTable = sqliteTable("users", {
    sub: text("sub").primaryKey(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    role: text("role").notNull().default("user"),
    exp: integer("exp").notNull(),
});

export type UserRow = typeof usersTable.$inferSelect;
export type NewUserRow = typeof usersTable.$inferInsert;
