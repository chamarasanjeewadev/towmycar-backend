import AWS from 'aws-sdk';
import { DriverSearchService } from '../service/driversearch.service';
import { logger } from './index';

// Configure the region and credentials (if not already configured globally)
AWS.config.update({ region: 'us-east-1' });

// Create an SQS service object
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

// The URL of the SQS queue to poll from
const queueURL = 'https://sqs.us-east-1.amazonaws.com/211125761584/breakdown-request-queue';

export const pollMessagesFromSQS = async () => {
  logger.info('Starting to poll messages inside quotation service');
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
      logger.info(`Received ${data.Messages.length} messages`);

      // Process each message
      for (const message of data.Messages) {
        logger.info('Processing message:', message.Body);
        try {
          const snsNotification = JSON.parse(message.Body || '{}');
          const requestData = JSON.parse(snsNotification.Message);
          const { breakdownRequestId: requestId, userLocation } = requestData;
          const { latitude, longitude } = userLocation;
          
          console.log("Parsed requestData:", { requestId, latitude, longitude });

          if (latitude && longitude && requestId) {
            console.log("requestId just before calling driver search service...............", requestId,latitude,longitude);
            const nearbyDrivers = await DriverSearchService.findAndUpdateNearbyDrivers(
              latitude,
              longitude,
              requestId
            );
            logger.info(`Found ${nearbyDrivers.length} nearby drivers for request ${requestId}`);
          } else {
            logger.warn('Invalid message format:', requestData);
          }
        } catch (error) {
          logger.error('Error processing message:', error);
        }

        // Delete the message after processing
        const deleteParams = {
          QueueUrl: queueURL,
          ReceiptHandle: message.ReceiptHandle ?? "",
        };

        await sqs.deleteMessage(deleteParams).promise();
        logger.info('Message deleted:', message.MessageId);
      }
    } else {
      logger.info('No messages to process');
    }
  } catch (err) {
    logger.error('Error receiving messages:', err);
  }

  // Poll again after a short delay
  setTimeout(pollMessagesFromSQS, 5000);
};

// Start polling
// pollMessagesFromSQS();