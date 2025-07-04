import { FastifyInstance, FastifyRequest, FastifyReply  } from "fastify";

import { IdentifyContact } from "./service";
import { IdentifyRequest } from "./interface";
import { IdentifyRequestSchema, IdentifyResponseSchema } from "./schema"
import logger from "../../shared/logger/logger"


export const identifyContactRoutes = async (fastify: FastifyInstance) => {
    const identifyContactService = new IdentifyContact();

    fastify.route({
        method: "POST",
        url: "/identify",
        schema: {
            body: IdentifyRequestSchema,
            response: {
                200: IdentifyResponseSchema
            }
        },
        handler: async (request: FastifyRequest<{Body: IdentifyRequest}>, reply: FastifyReply) => {
            try {
                const result = await identifyContactService.identify(request.body);
                logger.info("IdentifyContactRoutes: identify: result: ", result);
                reply.status(200).send(result)
            } catch (error) {
                logger.error("IdentifyContactRoutes: Error: ", error);
                return reply.status(500).send({ error: "Internal Server Error", message: (error as Error).message});
            }
        }
    });
}