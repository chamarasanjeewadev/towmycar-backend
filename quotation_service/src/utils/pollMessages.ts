import AWS from 'aws-sdk';
import { DriverSearchService } from '../service/driversearch.service';
import { logger } from './index';

// Configure the region and credentials (if not already configured globally)
AWS.config.update({ region: 'us-east-1' });

// Create an SQS service object
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

// The URL of the SQS queue to poll from
const queueURL = process.env.SQS_QUEUE_URL;

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
    const data = await sqs.receiveMessage(params as any).promise();

    if (data.Messages) {
      // logger.info(`Quotation service Received messages from SQS....... ${JSON.stringify(data)} messages`);

      // Process each message
      for (const message of data.Messages) {
        console.log("message", message);
       logger.info('Processing message:', message.Body);
        try {
          const snsNotification = JSON.parse(message?.Body || '{}');
          console.log("snsNotification in quotation service", snsNotification);
          const requestData = JSON.parse(snsNotification?.Message || '{}');
          console.log("requestData in quotation service", requestData);
          const { breakdownRequestId: requestId,userId, userLocation } = requestData;
          console.log("requestId in quotation service", requestId);
          const { latitude, longitude } = userLocation||{};
          
          console.log("Parsed requestData in quotation service:", { requestId, latitude, longitude, userId });

          if (latitude && longitude && requestId) {
            console.log("requestId just before calling driver search service...............", requestId,latitude,longitude,userId);
            const nearbyDrivers = await DriverSearchService.findAndUpdateNearbyDrivers(
              latitude,
              longitude,
              requestId,userId
            );
            logger.info(`Found ${nearbyDrivers.length} nearby drivers for request ${requestId}`);
            const deleteParams = {
              QueueUrl: queueURL,
              ReceiptHandle: message.ReceiptHandle ?? "",
            };
    
            await sqs.deleteMessage(deleteParams as any).promise();
            logger.info('Message deleted:', message.MessageId);
          } else {
            logger.warn('Invalid message format:', requestData);
            const deleteParams = {
              QueueUrl: queueURL,
              ReceiptHandle: message.ReceiptHandle ?? "",
            };
    
            await sqs.deleteMessage(deleteParams as any).promise();
          }
        } catch (error) {
          const deleteParams = {
            QueueUrl: queueURL,
            ReceiptHandle: message.ReceiptHandle ?? "",
          };
  
          await sqs.deleteMessage(deleteParams as any).promise();
          logger.error('Error processing message inside quotation service pollMessages:', error);
        }

        // Delete the message after processing
       
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