import { DB } from "@breakdownrescue/database";
import {
  userProfile,
  breakdownRequest,
  UserProfile,
  BreakdownRequest,
  breakdownAssignment,
  driver,
  Driver,
  BreakdownAssignment,
} from "@breakdownrescue/database";
import { BreakdownRequestInput } from "../dto/breakdownRequest.dto";
import { eq, sql, desc, and } from "drizzle-orm";
import { UserStatus, DriverStatus } from "../enums";
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
    pageSize: number,
    userId?: number,
    requestId?: number
  ) => Promise<{
    requests: BreakdownRequestWithUserDetails[];
    totalCount: number;
  }>;

  getBreakdownAssignmentsByUserIdAndRequestId: (
    userId: number,
    requestId?: number
  ) => Promise<(BreakdownAssignment & { driver: Driver; user: UserProfile })[]>;
  updateUserStatusInBreakdownAssignment: (
    // userId: number,
    assignmentId: number,
    userStatus: UserStatus
  ) => Promise<BreakdownAssignment | null>;
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
      status: UserStatus.PENDING,
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
  pageSize: number,
  userId?: number,
  requestId?: number
): Promise<{
  requests: BreakdownRequestWithUserDetails[];
  totalCount: number;
}> => {
  console.log("hit repo..", userId, requestId);
  const offset = (page - 1) * pageSize;

  const baseQuery = DB.select({
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

  let filteredQuery = baseQuery.orderBy(desc(breakdownRequest.updatedAt));

  if (userId) {
    // @ts-ignore
    filteredQuery = filteredQuery.where(eq(breakdownRequest.userId, userId));
  }

  if (requestId) {
    // @ts-ignore
    filteredQuery = filteredQuery.where(eq(breakdownRequest.id, requestId));
  }

  const requests = await filteredQuery.limit(pageSize).offset(offset);

  const countQuery = DB.select({
    count: sql<number>`cast(count(*) as integer)`,
  }).from(breakdownRequest);

  let filteredCountQuery = countQuery;

  if (userId) {
    // @ts-ignore
    filteredCountQuery = filteredCountQuery.where(
      eq(breakdownRequest.userId, userId)
    );
    // @ts-ignore
    const [{ count }] = await filteredCountQuery;
  }

  if (requestId) {
    // @ts-ignore
    filteredCountQuery = filteredCountQuery.where(
      eq(breakdownRequest.id, requestId)
    );
  }

  const [{ count }] = await filteredCountQuery;

  return {
    requests,
    totalCount: count,
  };
};

const getBreakdownAssignmentsByUserIdAndRequestId = async (
  userId: number,
  requestId?: number
): Promise<(BreakdownAssignment & { driver: Driver; user: UserProfile })[]> => {
  let query = DB.select({
    assignment: {
      id: breakdownAssignment.id,
      requestId: breakdownAssignment.requestId,
      status: breakdownAssignment.status,
      userStatus: breakdownAssignment.userStatus,
      estimation: breakdownAssignment.estimation,
      explanation: breakdownAssignment.explanation,
      updatedAt: breakdownAssignment.updatedAt,
    },
    driver: {
      id: driver.id,
      email: driver.email,
      fullName: driver.fullName,
      phoneNumber: driver.phoneNumber,
    },
    user: {
      id: userProfile.id,
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      email: userProfile.email,
    },
  })
    .from(breakdownAssignment)
    .innerJoin(driver, eq(breakdownAssignment.driverId, driver.id))
    .innerJoin(
      breakdownRequest,
      eq(breakdownAssignment.requestId, breakdownRequest.id)
    )
    .innerJoin(userProfile, eq(breakdownRequest.userId, userProfile.id))
    .where(eq(userProfile.id, userId));

  if (requestId) {
    // @ts-ignore
    query = query.where(eq(breakdownRequest.id, requestId));
  }

  const result = await query.orderBy(desc(breakdownAssignment.updatedAt));

  return result as unknown as (BreakdownAssignment & {
    driver: Driver;
    user: UserProfile;
  })[];
};

const updateUserStatusInBreakdownAssignment = async (
  assignmentId: number,
  userStatus: UserStatus
): Promise<BreakdownAssignment | null> => {
  const result = await DB.update(breakdownAssignment)
    .set({ userStatus: userStatus })
    .where(eq(breakdownAssignment.id, assignmentId))
    .returning();

  return result.length > 0 ? result[0] : null;
};

export const BreakdownRequestRepository: BreakdownRequestRepositoryType = {
  saveBreakdownRequest,
  getAllBreakdownRequestsWithUserDetails,
  getPaginatedBreakdownRequestsWithUserDetails,
  getBreakdownAssignmentsByUserIdAndRequestId,
  updateUserStatusInBreakdownAssignment,
};
