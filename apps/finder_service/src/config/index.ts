import dotenv from "dotenv";
dotenv.config();

export const APP_PORT = process.env.APP_PORT;
export const DB_URL = process.env.DB_URL;
export const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL;
export const BREAKDOWN_REQUEST_SNS_TOPIC_ARN = process.env.BREAKDOWN_REQUEST_SNS_TOPIC_ARN;
export const NOTIFICATION_REQUEST_SNS_TOPIC_ARN = process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN;
export const VIEW_REQUEST_BASE_URL = process.env.VIEW_REQUEST_BASE_URL;
export const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;


// SMS Configuration


