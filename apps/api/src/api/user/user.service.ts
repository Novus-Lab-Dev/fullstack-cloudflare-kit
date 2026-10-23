import type { D1Client } from "../../db/contracts/base.repository";
import { UserRepository } from "../../db/contracts/user.repository";


/** Users business layer; persistence CRUD is inherited from UserRepository. */
export class UserService extends UserRepository {

    constructor(db: D1Client) {
        super(db);
    }
}
