import expressApp from "./express-app";
import { logger } from "./utils";
import { pollMessagesFromSQS, handler } from "./utils/pollMessages";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.APP_PORT || 9000;
const isProduction = process.env.NODE_ENV === "production";

export const StartServer = async () => {
  logger.info("Starting the server...");
  expressApp.listen(PORT, () => {
    logger.info(`App is listening on port ${PORT}`);
    logger.info("Initiating SQS message polling...");
    pollMessagesFromSQS();
  });

  process.on("uncaughtException", async err => {
    console.log("Caught exception:", err);
    logger.error("Uncaught exception:", err.message);
    process.exit(1);
  });
};

if (isProduction) {
  logger.info("Running in production mode. Lambda handler is available.");
  module.exports.handler = handler;
} else {
  StartServer().then(() => {
    logger.info("Server startup complete");
  });
}

// Lambda function to handle SQS events
