import express, { NextFunction, Request, Response } from "express";
import AWS from "aws-sdk";
const router = express.Router();
const topicArn = `arn:aws:sns:us-east-1:211125761584:quotationRequest`;
const sns = new AWS.SNS({
  // endpoint: 'http://localhost:4566', // Use this for LocalStack
  region: "us-east-1",
});

const publishMessage = async () => {
  const params = {
    Message: "new message published", // The message you want to send
    TopicArn: topicArn, // Replace with the ARN of your topic
  };

  try {
    const result = await sns.publish(params).promise();
    console.log("Message ID:", result.MessageId);
  } catch (error) {
    console.error("Error publishing message:", error);
  }
};

router.post(
  "/order",
  async (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({ message: "create order" });
  }
);

router.get(
  "/order",
  async (req: Request, res: Response, next: NextFunction) => {
    await publishMessage();
    return res.status(200).json({ message: "create order" });
  }
);

router.get(
  "/order/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({ message: "create order" });
  }
);

router.delete(
  "/order/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({ message: "create order" });
  }
);

export default router;
