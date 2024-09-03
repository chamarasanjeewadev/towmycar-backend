import AWS from 'aws-sdk';

// Configure the region and credentials (if not already configured globally)
AWS.config.update({ region: 'us-east-1' });

// Create an SQS service object
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

// The URL of the SQS queue to poll from
const queueURL = 'https://sqs.us-east-1.amazonaws.com/211125761584/breakdown-request-queue';

export const pollMessages = async () => {
  const params = {
    QueueUrl: queueURL,
    MaxNumberOfMessages: 10, // Adjust to poll multiple messages at once
    WaitTimeSeconds: 20, // Long polling
  };

  try {
    // Poll messages from the queue
    const data = await sqs.receiveMessage(params).promise();

    if (data.Messages) {
      console.log(`Received ${data.Messages.length} messages`);

      // Process each message
      for (const message of data.Messages) {
        console.log('Processing message:', message.Body);

        // Delete the message after processing
        const deleteParams = {
          QueueUrl: queueURL,
          ReceiptHandle: message.ReceiptHandle??"",
        };

        await sqs.deleteMessage(deleteParams).promise();
        console.log('Message deleted:', message.MessageId);
      }
    } else {
      console.log('No messages to process');
    }
  } catch (err) {
    console.error('Error receiving messages:', err);
  }

  // Poll again after a short delay
  setTimeout(pollMessages, 5000);
};

// Start polling
// pollMessages();