import express, { Request, Response } from "express";
import { AnalyticsService } from "../service/analytics/analytics.service";
const router = express.Router();

router.get(
  "/recent-breakdown-requests",
  async (req: Request, res: Response) => {
    const result = await AnalyticsService.getRecentBreakdownRequests();
    res.json(result);
  },
);

router.get("/site-ratings", async (req: Request, res: Response) => {
  const result = await AnalyticsService.getSiteRatings();
  res.json(result);
});

router.get("/driver-ratings", async (req: Request, res: Response) => {
  const driverId = req.userInfo.driverId;
  const result = await AnalyticsService.getDriverRatings(driverId);
  res.json(result);
});

export default router;
