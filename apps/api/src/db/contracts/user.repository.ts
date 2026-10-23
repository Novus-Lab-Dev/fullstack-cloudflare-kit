import { eq } from "drizzle-orm";
import { usersTable, type NewUserRow, type UserRow } from "../schema/users.schema";
import { BaseRepository, type D1Client } from "./base.repository";

export type UserRecord = UserRow;

export type NewUserRecord = NewUserRow;
export class UserRepository extends BaseRepository<typeof usersTable> {

    constructor(db: D1Client) {
        super(db, usersTable, usersTable.sub);
    }

    async findByEmail(email: string): Promise<UserRecord | null> {
        return await this.findOne({ where: eq(usersTable.email, email) });
    }
}
