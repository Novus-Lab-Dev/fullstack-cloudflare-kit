import type { User } from "../../common/interfaces/user.interface";

export class UserService {
    private users: User[] = [];

    findAll(): User[] {
        return this.users;
    }

    findBySub(sub: string): User | undefined {
        return this.users.find(user => user.sub === sub);
    }

    create(user: User): User {
        this.users.push(user);
        return user;
    }

    remove(sub: string): { deleted: boolean } {
        this.users = this.users.filter(user => user.sub !== sub);
        return { deleted: true };
    }
}
