import { SNS } from "aws-sdk";
import { EmailNotificationType } from "../../enums";
// Configure AWS SDK to use credentials from the local AWS config file
const sns = new SNS({
  region: process.env.AWS_REGION || "us-east-1",
});

export const sendNotification = async (topicArn: string, message: any) => {
  const snsParams = {
    Message: JSON.stringify(message),
    TopicArn: topicArn,
  };
  try {
    const result = await sns.publish(snsParams).promise();
    console.log(`SNS notification sent for breakdown request ${snsParams}`);
    return {
      MessageId: result.MessageId,
      PublishTime: new Date().toISOString(),
    };
  } catch (error) {
    console.error(
      `Failed to send SNS notification for breakdown request ${snsParams}:`,
      error
    );
    throw error;
  }
};

export const sendPushNotificationAndEmail = async (breakdownRequestData: {
  type: EmailNotificationType;
  payload: any;
}) => {
  console.log(
    "breakdownRequestData inside sendBreakdownPushNotification",
    breakdownRequestData
  );
  const params = {
    Message: JSON.stringify({
      ...breakdownRequestData,
    }),
    TopicArn: process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN,
  };

  try {
    const result = await sns.publish(params).promise();
    console.log(`SNS for push notification sent for breakdown request `);
    return {
      MessageId: result.MessageId,
      PublishTime: new Date().toISOString(),
    };
  } catch (error) {
    console.error(
      `Failed to send SNS notification for breakdown request`,
      error
    );
    throw error;
  }
};
