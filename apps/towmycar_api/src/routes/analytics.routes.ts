import express, { Request, Response, NextFunction } from "express";
import { AnalyticsService } from "../service/analytics/analytics.service";
import { clerkAuthMiddleware } from "../middleware/clerkAuth";
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

router.get(
  "/driver-ratings",
  clerkAuthMiddleware("driver"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const driverId = req?.userInfo?.driverId;
      const result = await AnalyticsService.getDriverRatings(driverId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
