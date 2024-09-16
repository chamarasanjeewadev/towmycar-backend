import expressApp from "./express-app";
import { logger } from "./utils";
import { pollMessagesFromSQS } from "./utils/pollMessages";

const PORT = process.env.APP_PORT || 9005;

export const StartServer = async () => {
  expressApp.listen(PORT, () => {
    logger.info(`App is listening to ${PORT}`);
    pollMessagesFromSQS();
  });

  process.on("uncaughtException", async err => {
    logger.error(err);
    process.exit(1);
  });
};

StartServer().then(() => {
  logger.info("server is up");
});
