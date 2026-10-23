import { eq } from "drizzle-orm";
import { UserRepository, type UserRecord } from "../../db/contracts/user.repository";
import type { D1Client, PaginatedResult } from "../../db/contracts/base.repository";
import { usersTable } from "../../db/schema/users.schema";
import type { CreateUserDto, ListUsersQueryDto } from "./dto/user.dto";

const DEFAULT_USER_ROLE = "user";
const USER_TTL_SECONDS = 60 * 60 * 24 * 30;

/** Users business layer; persistence CRUD is inherited from UserRepository. */
export class UserService extends UserRepository {

    constructor(db: D1Client) {
        super(db);
    }

    listUsers(query: ListUsersQueryDto = {}): Promise<PaginatedResult<UserRecord>> {
        return this.findWithPagination({
            where: query.role ? eq(usersTable.role, query.role) : undefined,
            page: query.page,
            limit: query.limit,
        });
    }

    findBySub(sub: string): Promise<UserRecord | null> {
        return this.findOne({ where: eq(usersTable.sub, sub) });
    }

    createUser(data: CreateUserDto): Promise<UserRecord> {
        return this.create({
            sub: crypto.randomUUID(),
            email: data.email,
            name: data.name,
            role: data.role ?? DEFAULT_USER_ROLE,
            exp: Math.floor(Date.now() / 1000) + USER_TTL_SECONDS,
        });
    }

    async removeUser(sub: string): Promise<{ deleted: boolean }> {
        return { deleted: await this.delete(sub) };
    }
}
