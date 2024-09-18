import dotenv from "dotenv";
dotenv.config();

export const DB_URL = process.env.DB_URL;
export const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL;
export const BREAKDOWN_REQUEST_SNS_TOPIC_ARN = process.env.BREAKDOWN_REQUEST_SNS_TOPIC_ARN;
export const NOTIFICATION_REQUEST_SNS_TOPIC_ARN = process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN;
export const VIEW_REQUEST_BASE_URL = process.env.VIEW_REQUEST_BASE_URL;

// Add these new config values
export const COGNITO_USER_POOL_ID  = process.env.COGNITO_USER_POOL_ID as string;
export const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID as string;

// You can add console.log here for debugging

