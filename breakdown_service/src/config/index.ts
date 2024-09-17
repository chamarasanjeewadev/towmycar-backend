import dotenv from "dotenv";
dotenv.config();

export const DB_URL = process.env.DB_URL;
export const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL;
export const BREAKDOWN_REQUEST_SNS_TOPIC_ARN = process.env.BREAKDOWN_REQUEST_SNS_TOPIC_ARN;
export const NOTIFICATION_REQUEST_SNS_TOPIC_ARN = process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN;
export const VIEW_REQUEST_BASE_URL = process.env.VIEW_REQUEST_BASE_URL;

// You can add console.log here for debugging
console.log('DB_URL:', DB_URL);
console.log('SQS_QUEUE_URL:', SQS_QUEUE_URL);
console.log('BREAKDOWN_REQUEST_SNS_TOPIC_ARN:', BREAKDOWN_REQUEST_SNS_TOPIC_ARN);
console.log('NOTIFICATION_REQUEST_SNS_TOPIC_ARN:', NOTIFICATION_REQUEST_SNS_TOPIC_ARN);
console.log('VIEW_REQUEST_BASE_URL:', VIEW_REQUEST_BASE_URL);
