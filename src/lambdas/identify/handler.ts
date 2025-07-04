import awsLambdaFastify from "aws-lambda-fastify";
import { createFastifyApp } from "./index";

const app = createFastifyApp();
export const handler = awsLambdaFastify(app);