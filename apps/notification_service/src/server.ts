import expressApp from "./express-app";
import { logger } from "./utils";
import { pollMessagesFromSQS, handler } from "./utils/pollMessages";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.APP_PORT || 9005;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

export const StartServer = async () => {
  expressApp.listen(PORT, () => {
    logger.info(`App is listening on port ${PORT}`);
    // if (!IS_PRODUCTION) {
    logger.info("Initiating SQS message polling...");
    pollMessagesFromSQS();
    // }
  });

  // Add graceful shutdown handling
  const shutdown = async () => {
    logger.info("Shutting down server...");
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  process.on("uncaughtException", async err => {
    logger.error("Uncaught exception:", err);
    process.exit(1);
  });
};
export { handler };
if (IS_PRODUCTION) {
  logger.info("Running in production mode. Lambda handler is available.");
  module.exports.handler = handler;
} else {
  StartServer().then(() => {
    logger.info("Server startup complete");
  });
}
