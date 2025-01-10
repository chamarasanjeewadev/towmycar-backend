import { BreakdownRequest, ServiceRating } from "@towmycar/database";

import { AnalyticsRepository } from "../../repository/analytics.repository";

export const AnalyticsService = {
  async getRecentBreakdownRequests(): Promise<Partial<BreakdownRequest>[]> {
    return AnalyticsRepository.getRecentBreakdownRequests();
  },
  async getSiteRatings(): Promise<Partial<ServiceRating>[]> {
    return AnalyticsRepository.getSiteRatings();
  },
  async getDriverRatings(driverId: number): Promise<Partial<ServiceRating>[]> {
    const result = await AnalyticsRepository.getDriverRatings(driverId);
    const uniqueResult = result.filter(
      (x, index, self) =>
        index === self.findIndex(t => t.requestId === x.requestId),
    );
    return uniqueResult;
  },
};
