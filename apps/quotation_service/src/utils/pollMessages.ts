import AWS from "aws-sdk";
import { DriverSearchService } from "../service/driversearch.service";
import { logger } from "./index";

// Configure the region and credentials (if not already configured globally)
AWS.config.update({ region: "us-east-1" });
logger.info("AWS SDK configured with region: us-east-1");

// Create an SQS service object
const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });
logger.info("SQS service object created");

// The URL of the SQS queue to poll from
const queueURL = process.env.SQS_QUEUE_URL;
logger.info(`SQS Queue URL: ${queueURL}`);

export async function processMessage(message: AWS.SQS.Message) {
  logger.info(`Processing message with ID: ${message.MessageId}`);
  logger.debug("Message body:", message.Body);
  try {
    const snsNotification = JSON.parse(message?.Body || "{}");
    const requestData = JSON.parse(snsNotification?.Message || "{}");
    const { requestId, customerId, userLocation } = requestData;
    const { latitude, longitude } = userLocation || {};

    logger.info("Parsed requestData in quotation service:", {
      requestId,
      customerId,
      latitude,
      longitude,
    });

    if (latitude && longitude && requestId) {
      logger.info(
        `Calling driver search service for request: ${requestId}, lat: ${latitude}, lon: ${longitude}, customerId: ${customerId}`
      );
      const nearbyDrivers =
        await DriverSearchService.findAndNotifyNearbyDrivers(
          latitude,
          longitude,
          requestId,
          customerId
        );
      logger.info(
        `Found ${nearbyDrivers.length} nearby drivers for request ${requestId}`
      );
    } else {
      logger.warn("Invalid message format. RequestData:", requestData);
    }
  } catch (error) {
    logger.error(
      "Error processing message inside quotation service pollMessages:",
      error
    );
    logger.error("Error stack:", (error as Error).stack);
  } finally {
    await deleteMessage(message);
  }
}

async function deleteMessage(message: AWS.SQS.Message) {
  logger.info(`Deleting message with ID: ${message.MessageId}`);
  if (!queueURL) {
    throw new Error("SQS_QUEUE_URL is not defined");
  }
  const deleteParams: AWS.SQS.DeleteMessageRequest = {
    QueueUrl: queueURL,
    ReceiptHandle: message.ReceiptHandle!,
  };
  try {
    await sqs.deleteMessage(deleteParams).promise();
    logger.info(`Message deleted successfully: ${message.MessageId}`);
  } catch (error) {
    logger.error(`Error deleting message ${message.MessageId}:`, error);
  }
}

export const pollMessagesFromSQS = async () => {
  logger.info("Starting to poll messages inside quotation service");
  const params = {
    QueueUrl: queueURL,
    MaxNumberOfMessages: 10,
    WaitTimeSeconds: 20,
  };

  try {
    logger.info("Polling for messages...");
    const data = await sqs.receiveMessage(params as any).promise();

    if (data.Messages) {
      logger.info(`Received ${data.Messages.length} messages`);
      for (const message of data.Messages) {
        logger.info(`Processing message: ${message.MessageId}`);
        await processMessage(message);
      }
    } else {
      logger.info("No messages to process in this poll");
    }
  } catch (err) {
    logger.error("Error receiving messages:", err);
    logger.error("Error stack:", (err as Error).stack);
  }

  logger.info("Scheduling next poll in 5 seconds");
  setTimeout(pollMessagesFromSQS, 5000);
};

// Start polling
// pollMessagesFromSQS();
