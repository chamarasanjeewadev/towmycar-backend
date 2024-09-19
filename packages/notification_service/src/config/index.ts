import dotenv from "dotenv";
dotenv.config();

export const DB_URL = process.env.DB_URL;
export const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL;

// You can add a console.log here for debugging
console.log('DB_URL:', DB_URL);
console.log('SQS_QUEUE_URL:', SQS_QUEUE_URL);
