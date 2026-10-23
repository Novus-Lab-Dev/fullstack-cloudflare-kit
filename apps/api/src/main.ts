import { Hono } from 'hono'
import { AppModule } from './app.module'

class AppBootstrap {
  app: Hono;

  constructor() {
    this.app = new Hono();
    this.init()
  }

  init() {
    return new AppModule(this.app);
  }
}

export default new AppBootstrap().app