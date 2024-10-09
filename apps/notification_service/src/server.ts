import expressApp from "./express-app";
import { logger } from "./utils";
import { pollMessagesFromSQS } from "./utils/pollMessages";
import express from 'express';
import { startKafkaConsumer, stopKafkaConsumer } from './utils/kafkaConsumer';

const PORT = process.env.APP_PORT || 9005;

export const StartServer = async () => {
  expressApp.listen(PORT, () => {
    logger.info(`App is listening to ${PORT}`);
    pollMessagesFromSQS();
    // startKafkaConsumer(); // Add this line to start the Kafka consumer
  });

  // Add graceful shutdown handling
  const shutdown = async () => {
    logger.info('Shutting down server...');
    await stopKafkaConsumer();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  process.on("uncaughtException", async err => {
    logger.error(err);
    process.exit(1);
  });
};

StartServer().then(() => {
  logger.info("server is up");
});
