import express, { NextFunction, Request, Response } from "express";
import Pusher from "pusher";
import { DriverService } from "../service/driver/driver.service";
import * as ChatService from "../service/chat/chat.service";
import { MessageSender } from "@towmycar/common";
import { clerkAuthMiddleware } from "../middleware/clerkAuth";
import { tokenAuthMiddleware } from "../middleware/tokenAuth";
// Add this enum at the top of the file

const router = express.Router();
const driverService = new DriverService();

// const pusher = new Pusher({
//   appId: process.env.PUSHER_APP_ID!,
//   key: process.env.PUSHER_APP_KEY!,
//   secret: process.env.PUSHER_APP_SECRET!,
//   cluster: process.env.PUSHER_APP_CLUSTER!,
//   useTLS: true,
// });

router.post(
  "/send-driver-message",
  clerkAuthMiddleware("driver"),
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      message,
      username,
      requestId,
      driverId,
      sender,
    }: {
      message: string;
      username: string;
      requestId: number;
      driverId: number;
      sender: MessageSender;
    } = req.body;

    try {
      // Validate input
      if (!message || !username || !requestId || !driverId || !sender) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      await ChatService.sendPusherMessage({
        message,
        username,
        requestId,
        driverId,
        sender,
      });

      res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
      next(error);
      
    }
  },
);

router.post(
  "/send-user-message",
  clerkAuthMiddleware("customer"),
  async (req: Request, res: Response) => {
    const {
      message,
      username,
      requestId,
      driverId,
      sender,
    }: {
      message: string;
      username: string;
      requestId: number;
      driverId: number;
      sender: MessageSender;
    } = req.body;

    try {
      // Validate input
      if (!message || !username || !requestId || !driverId || !sender) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      await ChatService.sendPusherMessage({
        message,
        username,
        requestId,
        driverId,
        sender,
      });

      res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.get(
  "/assignments/:requestId",
  tokenAuthMiddleware,
  async (req: Request, res: Response) => {
    try {
      const requestId = parseInt(req.params.requestId, 10);
      if (isNaN(requestId)) {
        return res.status(400).json({ error: "Invalid request ID" });
      }

      const assignments =
        await ChatService.getBreakdownAssignmentsByRequestId(requestId);
      res.status(200).json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// New route to get assignments by driverId
router.get(
  "/assignments/driver/:driverId",
  async (req: Request, res: Response) => {
    try {
      const driverId = parseInt(req.params.driverId, 10);
      if (isNaN(driverId)) {
        return res.status(400).json({ error: "Invalid driver ID" });
      }

      const assignments =
        await driverService.getDriverRequestsWithInfo(driverId);
      res.status(200).json(assignments);
    } catch (error) {
      console.error("Error fetching driver assignments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// New route to get all chats for a request
router.get("/chats/:requestId", async (req: Request, res: Response) => {
  try {
    const requestId = parseInt(req.params.requestId, 10);
    if (isNaN(requestId)) {
      return res.status(400).json({ error: "Invalid request ID" });
    }

    const chats = await ChatService.getChatsForRequest(requestId);
    res.status(200).json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// New route to upsert a chat
router.post("/chats", async (req: Request, res: Response) => {
  try {
    const chatData = req.body;
    const upsertedChat = await ChatService.upsertChat(chatData);
    res.status(200).json(upsertedChat);
  } catch (error) {
    console.error("Error upserting chat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// New route to get chats by driverId and requestId
router.get(
  "/chats/:driverId/:requestId",
  async (req: Request, res: Response) => {
    try {
      const driverId = parseInt(req.params.driverId, 10);
      const requestId = parseInt(req.params.requestId, 10);
      if (isNaN(driverId) || isNaN(requestId)) {
        return res
          .status(400)
          .json({ error: "Invalid driver ID or request ID" });
      }

      const chats = await ChatService.getChatsForDriverAndRequest(
        driverId,
        requestId,
      );
      res.status(200).json(chats);
    } catch (error) {
      console.error("Error fetching chats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;

// need to add a route to get all messages for a breakdon assignment info for a requestId
