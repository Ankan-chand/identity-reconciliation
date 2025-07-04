import fastify from "fastify";
import { registerCors } from "../../app/plugins/cors";
import { identifyContactRoutes } from "./routes";


export function createFastifyApp() {
    // create fastify instance
    const app:any = fastify({
        logger: false
    });

    // register cors
    registerCors(app);

    // register identify routes
    app.register(identifyContactRoutes);

    return app;
}