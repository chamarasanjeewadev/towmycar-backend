import AWS from "aws-sdk";
import { UserNotificationService } from "../service/notification.service";
import { logger } from "./index";
import { sendEmail } from "./email.service";
// Configure the region and credentials (if not already configured globally)
AWS.config.update({ region: "us-east-1" });

// Create an SQS service object
const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });

// The URL of the SQS queue to poll from
const queueURL =
  "https://sqs.us-east-1.amazonaws.com/211125761584/breakdown-notification-queue";

export const pollMessagesFromSQS = async () => {
  logger.info("Starting to poll messages inside notification service");
  const params = {
    QueueUrl: queueURL,
    MaxNumberOfMessages: 10, // Adjust to poll multiple messages at once
    WaitTimeSeconds: 20, // Long polling
  };
  logger.info("polling messages");
  try {
    // Poll messages from the queue
    const data = await sqs.receiveMessage(params).promise();

    if (data.Messages) {
      // logger.info(`Received messages for notification service ${JSON.stringify(data.Messages)} messages`);

      // Process each message
      for (const message of data.Messages) {
        // logger.info('Processing message:', message.Body);
        try {
          const snsNotification = JSON.parse(message.Body || "{}");
          console.log("snsNotification", snsNotification);

          if (snsNotification.Message) {
            const messageData = JSON.parse(snsNotification.Message);
            console.log("Parsed message data:", messageData);

            if (messageData.type && messageData.payload) {
              console.log(
                "Message type and payload:",
                messageData.type,
                messageData.payload
              );
              sendEmail(messageData.type, messageData.payload);

              const deleteParams = {
                QueueUrl: queueURL,
                ReceiptHandle: message.ReceiptHandle ?? "",
              };
      
              await sqs.deleteMessage(deleteParams as any).promise();
            } else {
              logger.warn('Invalid message format: missing type or payload');
            }
          } else {
            logger.warn('Invalid SNS notification: missing Message field');
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
    logger.error("Error receiving messages:", err);
  }

  // Poll again after a short delay
  setTimeout(pollMessagesFromSQS, 5000);
};

// Start polling
// pollMessagesFromSQS();
