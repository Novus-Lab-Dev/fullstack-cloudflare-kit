import { Hono } from "hono";


export class IController {
    app: Hono;
    constructor(app: Hono) {
        this.app = app;
    }
}