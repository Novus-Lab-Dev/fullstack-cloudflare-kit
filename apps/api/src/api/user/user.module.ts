import { IModule } from "../../common/interfaces/module";
import { UserController } from "./user.controller";

export class UserModule extends IModule {
    constructor() {
        super(UserController.basePath);
        new UserController(this.app);
    }
}
