import AWS from "aws-sdk";
import { DriverSearchService } from "../service/driversearch.service";
import { logger } from "./index";
import { SQSEvent, Callback } from "aws-lambda";
import { Context } from "vm";

// Configure the region and credentials (if not already configured globally)
AWS.config.update({ region:process.env.REGION});
logger.info("AWS SDK configured");

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
    logger.error("Error processing message inside quotation service :", error);
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
  setTimeout(pollMessagesFromSQS, 15000);
};

export const handler = async (
  event: SQSEvent,
  context: Context,
  callback: Callback
) => {
  logger.info(
    "Lambda function triggered. Received SQS event:",
    JSON.stringify(event)
  );

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
      body: JSON.stringify({
        message: "Success",
        processedMessages: event.Records.length,
      }),
    });
  } catch (error: any) {
    logger.error("Error processing SQS event in Lambda function:", error);
    logger.error("Error stack:", error.stack);
    callback(error);
  }
};
