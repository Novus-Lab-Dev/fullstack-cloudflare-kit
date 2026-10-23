import { Hono } from 'hono'
import type { AppEnv } from './common/interfaces/app-env.interface'
import { AppModule } from './app.module'

class AppBootstrap {
  app: Hono<AppEnv>;

  constructor() {
    this.app = new Hono<AppEnv>();
    this.init()
  }

  init() {
    return new AppModule(this.app);
  }
}

export default new AppBootstrap().app