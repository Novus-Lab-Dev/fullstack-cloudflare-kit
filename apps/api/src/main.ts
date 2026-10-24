import { Hono } from 'hono'
import type { AppEnv } from './common/interfaces/app-env.interface'
import { AppModule } from './app.module'

class AppBootstrap {
  app: Hono<AppEnv>;
  appModule!: AppModule;

  constructor() {
    this.app = new Hono<AppEnv>();
    this.init()
  }

  init() {
    this.appModule = new AppModule(this.app);
    return this.appModule;
  }
}

const bootstrap = new AppBootstrap();

export default {
  fetch: bootstrap.app.fetch,
  scheduled(event: ScheduledEvent, env: AppEnv['Bindings'], ctx: ExecutionContext) {
    bootstrap.appModule.scheduled(event, env, ctx)
  },
}

// export default new AppBootstrap().app