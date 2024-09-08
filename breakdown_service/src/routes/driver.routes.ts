import express, { Request, Response } from "express";
import { DriverSchema } from "../dto/driver.dto";
import { registerDriver } from "../service/driver.service";
import { DriverRepository } from "../repository/driver.repository";
import { DriverService } from "../service/driver.service";
import { authenticateJWT } from "../middleware/auth";

const router = express.Router();
const driverService = new DriverService();

// Remove the "/driver" prefix from all routes
router.post("/register", async (req: Request, res: Response) => {
  try {
    const result = DriverSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.format() });
    }

    const newDriver = await registerDriver(result.data, DriverRepository);

    res
      .status(201)
      .json({ message: "Driver registered successfully", driver: newDriver });
  } catch (error) {
    console.error("Error registering driver:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get(
  "/:driverId/assigned-requests",
  authenticateJWT,
  async (req, res) => {
    try {
      const driverId = parseInt(req.params.driverId);
      if (isNaN(driverId)) {
        return res.status(400).json({ error: "Invalid driver ID" });
      }

      const assignments = await driverService.getDriverRequestsWithInfo(
        driverId
      );
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching driver assigned requests:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.get(
  "/:driverId/assigned-request/:requestId",
  authenticateJWT,
  async (req, res) => {
    try {
      const driverId = parseInt(req.params.driverId);
      const requestId = parseInt(req.params.requestId);
      if (isNaN(driverId) || isNaN(requestId)) {
        return res
          .status(400)
          .json({ error: "Invalid driver ID or request ID" });
      }

      const assignment = await driverService.getDriverRequestWithInfo(
        driverId,
        requestId
      );
      if (!assignment) {
        return res.status(404).json({ error: "Driver request not found" });
      }
      res.json(assignment);
    } catch (error) {
      console.error("Error fetching driver request:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.patch("/request/:requestId/status", authenticateJWT, async (req, res) => {
  const { requestId } = req.params;
  const { driverId, status } = req.body;
  console.log("backend fired", driverId, status);
  if (!driverId || !status) {
    return res.status(400).json({ error: "driverId and status are required" });
  }

  if (status !== "accepted" && status !== "rejected") {
    return res
      .status(400)
      .json({ error: 'Status must be either "accepted" or "rejected"' });
  }

  try {
    const updated = await driverService.updateDriverRequestStatus(
      Number(driverId),
      Number(requestId),
      status
    );
    if (updated) {
      res.json({ message: `Driver request status updated to ${status}` });
    } else {
      res.status(404).json({ error: "Driver request not found" });
    }
  } catch (error) {
    console.error("Error updating driver request status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
