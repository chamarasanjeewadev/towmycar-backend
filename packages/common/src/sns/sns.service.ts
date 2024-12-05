import AWS, { SNS } from "aws-sdk";
import {
  BreakdownNotificationType,
  DriverNotificationPayload,
  DriverQuotedPayload,
} from "../types/types";
import { NotificationType } from "../enums";

// AWS.config.update({ region:process.env.REGION});

const sns = new SNS({
  region: process.env.REGION || "eu-west-2",
});

//TODO need to refactor this to use sendNotification
export const sendSNS = async (topicArn: string, message: any) => {
  const snsParams = {
    Message: JSON.stringify(message),
    TopicArn: topicArn,
  };
  try {
    const result = await sns.publish(snsParams).promise();
    console.log(
      `SNS notification sent for breakdown request ${message} ${topicArn}`
    );
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

export const sendNotification = async (
  topicArn: string,
  message: {
    subType: NotificationType;
    payload:
      | DriverNotificationPayload[]
      | DriverNotificationPayload
      | DriverQuotedPayload;
  }
) => {
  const snsParams = {
    Message: JSON.stringify(message),
    TopicArn: topicArn,
  };
  try {
    const result = await sns.publish(snsParams).promise();
    console.log(
      `SNS notification sent for breakdown request ${message} ${topicArn}`
    );
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
  type: NotificationType;
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
