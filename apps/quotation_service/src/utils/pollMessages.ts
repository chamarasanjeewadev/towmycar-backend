import AWS from "aws-sdk";
import { DriverSearchService } from "../service/driversearch.service";
import { logger } from "./index";

// Configure the region and credentials (if not already configured globally)
AWS.config.update({ region: "us-east-1" });

// Create an SQS service object
const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });

// The URL of the SQS queue to poll from
const queueURL = process.env.SQS_QUEUE_URL;

async function processMessage(message: AWS.SQS.Message) {
  logger.info("Processing message:", message.Body);
  try {
    const snsNotification = JSON.parse(message?.Body || "{}");
    const requestData = JSON.parse(snsNotification?.Message || "{}");
    const { breakdownRequestId: requestId, userId, userLocation } = requestData;
    const { latitude, longitude } = userLocation || {};

    logger.info("Parsed requestData in quotation service:", {
      requestId,
      latitude,
      longitude,
      userId,
    });

    if (latitude && longitude && requestId) {
      logger.info(
        "Calling driver search service for request:",
        requestId,
        latitude,
        longitude,
        userId
      );
      const nearbyDrivers =
        await DriverSearchService.findAndNotifyNearbyDrivers(
          latitude,
          longitude,
          requestId,
          userId
        );
      logger.info(
        `Found ${nearbyDrivers.length} nearby drivers for request ${requestId}`
      );
    } else {
      logger.warn("Invalid message format:", requestData);
    }
  } catch (error) {
    logger.error(
      "Error processing message inside quotation service pollMessages:",
      error
    );
  } finally {
    await deleteMessage(message);
  }
}

async function deleteMessage(message: AWS.SQS.Message) {
  const deleteParams = {
    QueueUrl: queueURL,
    ReceiptHandle: message.ReceiptHandle ?? "",
  };
  await sqs.deleteMessage(deleteParams as any).promise();
  logger.info("Message deleted:", message.MessageId);
}

export const pollMessagesFromSQS = async () => {
  logger.info("Starting to poll messages inside quotation service");
  const params = {
    QueueUrl: queueURL,
    MaxNumberOfMessages: 10, // Adjust to poll multiple messages at once
    WaitTimeSeconds: 20, // Long polling
  };

  try {
    // Poll messages from the queue
    const data = await sqs.receiveMessage(params as any).promise();

    if (data.Messages) {
      // Process each message
      for (const message of data.Messages) {
        await processMessage(message);
      }
    } else {
      logger.info("No messages to process");
    }
  } catch (err) {
    logger.error("Error receiving messages:", err);
  }

  // Poll again after a short delay
  setTimeout(pollMessagesFromSQS, 5000);
};

// Start polling
// pollMessagesFromSQS();
