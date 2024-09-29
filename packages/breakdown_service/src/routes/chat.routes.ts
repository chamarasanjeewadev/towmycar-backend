import express, { Request, Response } from "express";
import Pusher from "pusher";
import bodyParser from "body-parser";
import { BreakdownRequestRepository } from "../repository/breakdownRequest.repository";
import { DriverService } from "../service/driver/driver.service";
import {
  BreakdownAssignment,
  Driver,
  Customer,
} from "@breakdownrescue/database";

// Add this enum at the top of the file
export enum MessageSender {
  Driver = "driver",
  Customer = "customer"
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
    from,
  }: {
    message: string;
    username: string;
    requestId: string;
    driverId: string;
    from: MessageSender;
  } = req.body;

  try {
    // Validate input
    if (!message || !username || !requestId || !driverId || !from) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Determine the event name based on the sender
    const eventName = from === MessageSender.Driver ? "user-chat-message" : "driver-chat-message";

    // Trigger Pusher event
    await pusher.trigger(`breakdown-${requestId}-${driverId}`, eventName, {
      username,
      message,
      from,
    });
    console.log(`Message sent to channel: breakdown-${requestId}-${driverId}, Event: ${eventName}`);
    // TODO: Save the message to the database

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
      await BreakdownRequestRepository.getBreakdownAssignmentsByRequestId(
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
      const transformedAssignments = assignments.map(
        (
          assignment: BreakdownAssignment & { driver: Driver; user: Customer }
        ) => ({
          id: assignment.id,
          requestId: assignment.requestId,
          status: assignment.driverStatus,
          estimation: assignment.estimation,
          explanation: assignment.explanation,
          updatedAt: assignment.updatedAt,
          userLocation: assignment.user.postcode,
          userInfo: {
            id: assignment.user.id,
            name: assignment.user.mobileNumber,
            email: assignment.user.postcode,
          },
        })
      );

      res.status(200).json(transformedAssignments);
    } catch (error) {
      console.error("Error fetching driver assignments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;

// need to add a route to get all messages for a breakdon assignment info for a requestId
