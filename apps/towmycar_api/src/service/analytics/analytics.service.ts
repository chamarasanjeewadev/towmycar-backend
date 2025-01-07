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
    return AnalyticsRepository.getDriverRatings(driverId);
  },
};
