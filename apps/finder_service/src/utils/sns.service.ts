import { EmailNotificationType } from "@towmycar/database/enums";
import { BreakdownNotificationType } from "@towmycar/database/types/types";
import { SNS } from "aws-sdk";

// Configure AWS SDK to use credentials from the local AWS config file
const sns = new SNS({
  region: process.env.REGION || "us-east-1",
});

export const sendNotification = async (topicArn: string, message:BreakdownNotificationType ) => {
  const snsParams = {
    Message: JSON.stringify(message),
    TopicArn: topicArn,
  };
  try {
    const result = await sns.publish(snsParams).promise();
    console.log(`SNS notification sent for breakdown request ${message} ${topicArn}`);
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

export const sendPushNotificationAndEmail = async (
  breakdownRequestData:{type:EmailNotificationType, payload:any} 
) => {
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
