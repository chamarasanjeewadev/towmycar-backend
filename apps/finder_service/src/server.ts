import expressApp from "./express-app";
import { logger } from "./utils";
import { pollMessagesFromSQS, processMessage } from "./utils/pollMessages";
import dotenv from 'dotenv';
import { SQSEvent, SQSHandler, Context, Callback } from 'aws-lambda';
dotenv.config();

const PORT = process.env.APP_PORT || 9000;

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

StartServer().then(() => {
  logger.info("Server startup complete");
});

// Lambda function to handle SQS events
export const handler = async (event: SQSEvent, context: Context, callback: Callback) => {
  logger.info("Lambda function triggered. Received SQS event:", JSON.stringify(event));

  try {
    logger.info(`Processing ${event.Records.length} messages`);
    for (const record of event.Records) {
      logger.info(`Processing message with ID: ${record.messageId}`);
      const message = {
        Body: record.body,
        ReceiptHandle: record.receiptHandle,
        MessageId: record.messageId,
      };

      await processMessage(message);
      logger.info(`Finished processing message with ID: ${record.messageId}`);
    }

    logger.info("Successfully processed all messages in the SQS event");
    callback(null, {
      statusCode: 200,
      body: JSON.stringify({ message: "Success", processedMessages: event.Records.length })
    });
  } catch (error:any) {
    logger.error("Error processing SQS event in Lambda function:", error);
    logger.error("Error stack:", error.stack);
    callback(error);
  }
};
