import { UserNotificationService } from "../service/notification.service";
import AWS from "aws-sdk";
import { logger } from "./index";
import { SQS_QUEUE_URL } from "../config";
import { SQSEvent, SQSHandler, Context, Callback } from "aws-lambda";
import {
  BaseNotificationType,
  EmailNotificationType,
  PushNotificationPayload,
  PushNotificationType,
} from "@towmycar/common";
import {
  BreakdownNotificationType,
  EmailPayloadBaseType,
  EmailPayloadType,
} from "@towmycar/common";
import { sendEmail } from "./../service/email.service";

AWS.config.update({ region:process.env.REGION});
const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });
const queueURL = SQS_QUEUE_URL;

async function processMessage(message: AWS.SQS.Message) {
  try {
    const snsNotification = JSON.parse(message.Body || "{}");
    if (snsNotification.Message) {
      const messageData: BreakdownNotificationType = JSON.parse(
        snsNotification.Message
      );
      console.log("parsed sns msg",JSON.stringify(messageData));

      if (messageData.type && messageData.payload) {
        switch (messageData.type) {
          case BaseNotificationType.EMAIL:
            await sendEmail(
              messageData.subType as EmailNotificationType,
              messageData.payload as EmailPayloadType & EmailPayloadBaseType
            );
            break;
          case BaseNotificationType.PUSH:
            await UserNotificationService.sendPushNotification(
              messageData.subType as PushNotificationType,
              messageData.payload as PushNotificationPayload
            );
            break;
        }
       
        console.log("notification sent");
      } else {
        logger.warn("Invalid message format: missing type or payload");
      }
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
  logger.info("Polling messages");
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
