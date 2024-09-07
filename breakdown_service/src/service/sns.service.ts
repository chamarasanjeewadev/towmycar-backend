import { SNS } from 'aws-sdk';

// Configure AWS SDK
const sns = new SNS({
  region: process.env.AWS_REGION || 'us-east-1' // Replace 'us-east-1' with your default region if needed
});

export const sendBreakdownRequestNotification = async (breakdownRequestId: string, breakdownRequestData: any) => {
  const params = {
    Message: JSON.stringify({
      breakdownRequestId,
      ...breakdownRequestData,
    }),
    TopicArn: process.env.BREAKDOWN_REQUEST_SNS_TOPIC_ARN,
  };

  try {
    const result = await sns.publish(params).promise();
    console.log(`SNS notification sent for breakdown request ${breakdownRequestId}`);
    return {
      MessageId: result.MessageId,
      PublishTime: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Failed to send SNS notification for breakdown request ${breakdownRequestId}:`, error);
    throw error;
  }
};