import dotenv from "dotenv";
dotenv.config();

export const DB_URL = process.env.DB_URL;
export const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL;
export const BREAKDOWN_REQUEST_SNS_TOPIC_ARN = process.env.BREAKDOWN_REQUEST_SNS_TOPIC_ARN;
export const NOTIFICATION_REQUEST_SNS_TOPIC_ARN = process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN;
export const VIEW_REQUEST_BASE_URL = process.env.VIEW_REQUEST_BASE_URL;

export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;


