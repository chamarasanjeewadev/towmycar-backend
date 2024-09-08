import { DB } from "database";
import {
  userProfile,
  breakdownRequest,
  UserProfile,
  BreakdownRequest,
} from "database";
import { BreakdownRequestInput } from "../dto/breakdownRequest.dto";
import { eq, sql } from "drizzle-orm";

// Add this type definition
type BreakdownRequestWithUserDetails = {
  id: number;
  requestType: string;
  location: string;
  description: string | null;
  status: string;
  userId: number;
  firstName: string | null;
  lastName: string | null;
  userEmail: string | null;
};

// declare repository type
export type BreakdownRequestRepositoryType = {
  saveBreakdownRequest: (data: BreakdownRequestInput) => Promise<number>;
  getAllBreakdownRequestsWithUserDetails: () => Promise<
    BreakdownRequestWithUserDetails[]
  >;
  getPaginatedBreakdownRequestsWithUserDetails: (
    page: number,
    pageSize: number
  ) => Promise<{
    requests: BreakdownRequestWithUserDetails[];
    totalCount: number;
  }>;
};

const saveBreakdownRequest = async (
  data: BreakdownRequestInput
): Promise<number> => {
  const breakdownResult = await DB.insert(breakdownRequest)
    .values({
      userId: data.userId,
      requestType: data.requestType,
      locationAddress: data.locationAddress,
      userLocation: {
        x: data.userLocation.longitude,
        y: data.userLocation.latitude,
      },
      description: data.description || null,
      status: "pending",
    })
    .returning({ id: breakdownRequest.id });

  return breakdownResult[0].id;
};

const getAllBreakdownRequestsWithUserDetails = async (): Promise<
  BreakdownRequestWithUserDetails[]
> => {
  return DB.select({
    id: breakdownRequest.id,
    requestType: breakdownRequest.requestType,
    location: breakdownRequest.locationAddress,
    description: breakdownRequest.description,
    status: breakdownRequest.status,
    userId: breakdownRequest.userId,
    firstName: userProfile.firstName,
    lastName: userProfile.lastName,
    userEmail: userProfile.email,
  })
    .from(breakdownRequest)
    .leftJoin(userProfile, eq(userProfile.id, breakdownRequest.userId));
};

const getPaginatedBreakdownRequestsWithUserDetails = async (
  page: number,
  pageSize: number
): Promise<{
  requests: BreakdownRequestWithUserDetails[];
  totalCount: number;
}> => {
  const offset = (page - 1) * pageSize;

  const requests = await DB.select({
    id: breakdownRequest.id,
    requestType: breakdownRequest.requestType,
    location: breakdownRequest.locationAddress,
    description: breakdownRequest.description,
    status: breakdownRequest.status,
    userId: breakdownRequest.userId,
    firstName: userProfile.firstName,
    lastName: userProfile.lastName,
    userEmail: userProfile.email,
  })
    .from(breakdownRequest)
    .leftJoin(userProfile, eq(userProfile.id, breakdownRequest.userId))
    .limit(pageSize)
    .offset(offset);

  const [{ count }] = await DB.select({
    count: sql<number>`count(*)`,
  }).from(breakdownRequest);

  return {
    requests,
    totalCount: Number(count),
  };
};

export const BreakdownRequestRepository: BreakdownRequestRepositoryType = {
  saveBreakdownRequest,
  getAllBreakdownRequestsWithUserDetails,
  getPaginatedBreakdownRequestsWithUserDetails,
};
