import AWS from "aws-sdk";
import { logger } from "./index";
import { SQS_QUEUE_URL, SMS_CONFIG } from "../config";
import { SQSEvent, SQSHandler, Context, Callback } from "aws-lambda";
import {
  DeliveryNotificationType,
  BreakdownNotificationType,
} from "@towmycar/common";
import { EventEmitter } from "stream";
import { registerEmailListener } from "../listners/notification.email.listner";
import { registerPushNotificationListener } from "../listners/notification.push.listner";
import { registerSmsNotificationListener } from "../listners/notification.sms.listner";

AWS.config.update({ region: process.env.REGION });
const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });
const queueURL = SQS_QUEUE_URL;

const NOTIFICATION_TYPES = [
  DeliveryNotificationType.EMAIL,
  DeliveryNotificationType.PUSH,
  ...(SMS_CONFIG.isEnabled ? [DeliveryNotificationType.SMS] : []),
] as const;

const eventEmitter = new EventEmitter();
registerEmailListener(eventEmitter);
registerPushNotificationListener(eventEmitter);
// if (SMS_CONFIG.isEnabled) {
registerSmsNotificationListener(eventEmitter);
// }

function emitNotifications(
  emitter: EventEmitter,
  subType: string,
  payload: unknown
) {
  NOTIFICATION_TYPES.forEach(type => {
    emitter.emit(`${type}:${subType}`, payload);
  });
}

async function processMessage(message: AWS.SQS.Message) {
  try {
    const snsNotification = JSON.parse(message.Body || "{}");
    if (snsNotification.Message) {
      const messageData: BreakdownNotificationType = JSON.parse(
        snsNotification.Message
      );
      emitNotifications(eventEmitter, messageData.subType, messageData.payload);
    } else {
      logger.warn("Invalid SNS notification: missing Message field");
    }

    await sqs
      .deleteMessage({
        QueueUrl: queueURL!,
        ReceiptHandle: message.ReceiptHandle ?? "",
      })
      .promise();
  } catch (error) {
    logger.error("Error processing message:", error);
    throw error;
  }
}

export const pollMessagesFromSQS = async () => {
  logger.info("Polling notification messages");
  try {
    const data = await sqs
      .receiveMessage({
        QueueUrl: queueURL!,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20,
      })
      .promise();
    console.log("poll triggered....");

    if (data?.Messages && data.Messages.length > 0) {
      for (const message of data.Messages) {
        await processMessage(message);
      }
    } else {
      logger.info("No messages to process");
    }
  } catch (err) {
    logger.error("Error receiving messages", err);
  }

  setTimeout(pollMessagesFromSQS, 5000);
};

export const handler: SQSHandler = async (
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
      await processMessage({
        Body: record.body,
        ReceiptHandle: record.receiptHandle,
        MessageId: record.messageId,
      });
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
  } catch (error) {
    logger.error("Error processing SQS event in Lambda function:", error);
    callback(error as Error);
  }
};
