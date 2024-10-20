import { DriverService } from "../service/driver/driver.service";

const driverService = new DriverService();

router.get("/requests/:requestId", async (req, res) => {
  try {
    const driverId = req.user.id; // Assuming you have middleware that sets the user
    const requestId = parseInt(req.params.requestId, 10);

    const request = await driverService.getDriverRequestWithInfo(driverId, requestId);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json(request);
  } catch (error) {
    console.error("Error fetching driver request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
