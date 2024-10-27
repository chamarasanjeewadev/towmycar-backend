import express, { Request, Response } from "express";
import Pusher from "pusher";
import { BreakdownRequestService } from "../service/user/userBreakdownRequest.service";
import { DriverService } from "../service/driver/driver.service";

import * as ChatService from "../service/chat/chat.service";

// Add this enum at the top of the file
export enum MessageSender {
  Driver = "driver",
  Customer = "customer",
}

const router = express.Router();
const driverService = new DriverService();
// router.use(bodyParser.json());
interface MessagePayload {
  message: string;
  username: string;
  breakdownId: string;
}
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_APP_KEY!,
  secret: process.env.PUSHER_APP_SECRET!,
  cluster: process.env.PUSHER_APP_CLUSTER!,
  useTLS: true,
});

router.post("/send-message", async (req: Request, res: Response) => {
  const {
    message,
    username,
    requestId,
    driverId,
    sender,
  }: {
    message: string;
    username: string;
    requestId: string;
    driverId: string;
    sender: MessageSender;
  } = req.body;

  try {
    // Validate input
    if (!message || !username || !requestId || !driverId || !sender) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Determine the event name based on the sender
    const pusherEventName =
      sender === MessageSender.Driver
        ? "user-chat-message"
        : "driver-chat-message";

    // Trigger Pusher event
    await pusher.trigger(
      `breakdown-${requestId}-${driverId}`,
      pusherEventName,
      {
        username,
        message,
        sender,
      }
    );
    console.log(
      `Message sent to channel: breakdown-${requestId}-${driverId}, Event: ${pusherEventName}`
    );

    // Save the message to the database
    await ChatService.upsertChat({
      requestId: parseInt(requestId, 10),
      driverId: parseInt(driverId, 10),
      message,
      sender,
      sentAt: new Date(),
    });

    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/assignments/:requestId", async (req: Request, res: Response) => {
  try {
    const requestId = parseInt(req.params.requestId, 10);
    if (isNaN(requestId)) {
      return res.status(400).json({ error: "Invalid request ID" });
    }

    const assignments =
      await BreakdownRequestService.getBreakdownAssignmentsByRequestId(
        requestId
      );
    res.status(200).json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// New route to get assignments by driverId
router.get(
  "/assignments/driver/:driverId",
  async (req: Request, res: Response) => {
    try {
      const driverId = parseInt(req.params.driverId, 10);
      if (isNaN(driverId)) {
        return res.status(400).json({ error: "Invalid driver ID" });
      }

      const assignments = await driverService.getDriverRequestsWithInfo(
        driverId
      );

      // Transform the assignments to include only necessary information
      // const transformedAssignments = assignments.map(
      //   (
      //     assignment: BreakdownAssignment & {
      //       driver: Driver & Partial<User>;
      //       user: Customer & Partial<User>;
      //     }
      //   ) => ({
      //     id: assignment.id,
      //     requestId: assignment.requestId,
      //     driverStatus: assignment.driverStatus,
      //     userStatus: assignment.userStatus,
      //     estimation: assignment.estimation,
      //     explanation: assignment.explanation,
      //     updatedAt: assignment.updatedAt,
      //     userLocation: assignment.user.postcode,
      //     user: {
      //       id: assignment.user.id,
      //       firstName: assignment.user?.firstName,
      //       lastName: assignment.user?.lastName,
      //       email: assignment.user?.email,
      //     },
      //     driver: {
      //       id: assignment.driver?.id,
      //       firstName: assignment.driver?.firstName,
      //       lastName: assignment.driver?.lastName,
      //       email: assignment.driver?.email,
      //     },

      //   })
      // );

      res.status(200).json(assignments);
    } catch (error) {
      console.error("Error fetching driver assignments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
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
        requestId
      );
      res.status(200).json(chats);
    } catch (error) {
      console.error("Error fetching chats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;

// need to add a route to get all messages for a breakdon assignment info for a requestId
