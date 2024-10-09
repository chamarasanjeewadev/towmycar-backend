import { UserNotificationService } from '../service/notification.service';
import AWS from "aws-sdk";
import { logger } from "./index";
import { SQS_QUEUE_URL } from "../config";
import { sendDriverAcceptanceBreakdownPushNotification } from "../service/notification.service";
import { sendEmail } from "../service/email.service";
console.log("SQS_QUEUE_URL", SQS_QUEUE_URL);
AWS.config.update({ region: "us-east-1" });

// Create an SQS service object
const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });

// The URL of the SQS queue to poll from
const queueURL = SQS_QUEUE_URL;
console.log("queueURL", queueURL);
export const pollMessagesFromSQS = async () => {
  const params = {
    QueueUrl: queueURL,
    MaxNumberOfMessages: 10, // Adjust to poll multiple messages at once
    WaitTimeSeconds: 20, // Long polling
  };
  logger.info("polling messages");
  try {
    // Poll messages from the queue
    const data = await sqs.receiveMessage(params as any).promise();

    if (data.Messages) {
      // Process each message
      for (const message of data.Messages) {
        try {
          const snsNotification = JSON.parse(message.Body || "{}");
          console.log("snsNotification", snsNotification);

          if (snsNotification.Message) {
            const messageData = JSON.parse(snsNotification.Message);

            if (messageData.type && messageData.payload) {
              
              sendEmail(messageData.type, messageData.payload);
              // send push notification
              UserNotificationService.sendDriverAcceptanceBreakdownPushNotification(messageData.type, messageData.payload);
              const deleteParams = {
                QueueUrl: queueURL,
                ReceiptHandle: message.ReceiptHandle ?? "",
              };

              await sqs.deleteMessage(deleteParams as any).promise();
            } else {
              logger.warn("Invalid message format: missing type or payload");
            }
          } else {
            logger.warn("Invalid SNS notification: missing Message field");
            const deleteParams = {
              QueueUrl: queueURL,
              ReceiptHandle: message.ReceiptHandle ?? "",
            };

            await sqs.deleteMessage(deleteParams as any).promise();
          }

          // ... existing code for deleting the message ...
        } catch (error) {
          const deleteParams = {
            QueueUrl: queueURL,
            ReceiptHandle: message.ReceiptHandle ?? "",
          };

          await sqs.deleteMessage(deleteParams as any).promise();
          logger.error(
            "Error processing message inside notification service poll messages:",
            error
          );
        }

        // Delete the message after processing
      }
    } else {
      logger.info("No messages to process");
    }
  } catch (err) {
    logger.error("Error receiving messages in notification service", err);
  }

  // Poll again after a short delay
  setTimeout(pollMessagesFromSQS, 5000);
};

