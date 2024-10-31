import { pinoHttp } from "pino-http";
import pino from "pino";

const transport = process.env.NODE_ENV === 'production' 
  ? undefined 
  : {
      target: "pino-pretty",
      level: "error",
    };

export const logger = pino({
  level: "info",
  base: {
    serviceName: "tow_api",
    env: process.env.NODE_ENV,
  },
  serializers: pino.stdSerializers,
  timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
  transport,
});

export const httpLogger = pinoHttp({
  level: "error",
  logger,
});
