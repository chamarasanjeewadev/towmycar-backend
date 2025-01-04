import {
  DB,
  BreakdownRequest,
  desc,
  breakdownRequest,
  serviceRatings,
  ServiceRating as SiteRating,
  customer,
  user,
  eq,
} from "@towmycar/database";

type AnalyticsRepositoryType = {
  getRecentBreakdownRequests: () => Promise<Partial<BreakdownRequest>[]>;
  getSiteRatings: () => Promise<Partial<SiteRating>[]>;
};

export const AnalyticsRepository: AnalyticsRepositoryType = {
  async getRecentBreakdownRequests(): Promise<Partial<BreakdownRequest>[]> {
    const result = await DB.select({
      createdAt: breakdownRequest.createdAt,
      updatedAt: breakdownRequest.updatedAt,
      status: breakdownRequest.status,
      postCode: breakdownRequest.postCode,
      toPostCode: breakdownRequest.toPostCode,
      make: breakdownRequest.make,
      model: breakdownRequest.model,
      weight: breakdownRequest.weight,
    })
      .from(breakdownRequest)
      .orderBy(desc(breakdownRequest.updatedAt))
      .limit(10);
    return result;
  },
  async getSiteRatings(): Promise<Partial<SiteRating>[]> {
    const result = await DB.select({
      rating: serviceRatings.siteRating,
      feedback: serviceRatings.siteFeedback,
      createdAt: serviceRatings.createdAt,
      customer: {
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      },
    })
      .from(serviceRatings)
      .innerJoin(customer, eq(serviceRatings.customerId, customer.id))
      .innerJoin(user, eq(customer.userId, user.id))
      .orderBy(desc(serviceRatings.createdAt))
      .limit(10);
    return result;
  },
};
