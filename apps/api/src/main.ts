import { Hono } from 'hono'
import { AppModule } from './app.module'

class AppBootstrap {
  app: Hono = new Hono()

  constructor() {
    this.init()
  }

  init() {
    return new AppModule(this.app);
  }
}

export default new AppBootstrap().app