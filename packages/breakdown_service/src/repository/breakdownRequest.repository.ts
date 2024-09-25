import {
  DB,
  breakdownRequest,
  BreakdownRequest,
} from "@breakdownrescue/database";
import { BreakdownRequestInput } from "../dto/breakdownRequest.dto";
import { sql } from "drizzle-orm";
import { UserStatus } from "../enums";
import {
  customer,
  user,
  breakdownAssignment,
  driver,
  Driver,
  BreakdownAssignment,
  User,
} from "@breakdownrescue/database";
import { eq, desc, and } from "drizzle-orm";
import { DriverStatus } from "../enums";
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
  ) => Promise<(BreakdownAssignment & { driver: Driver; user: any })[]>;
  updateUserStatusInBreakdownAssignment: (
    // userId: number,
    assignmentId: number,
    userStatus: UserStatus
  ) => Promise<BreakdownAssignment | null>;
};

const saveBreakdownRequest = async (
  data: BreakdownRequestInput
): Promise<number> => {
  //@ts-ignore
  const x: BreakdownRequest = {
    // id: 0,
    customerId: data.customerId,
    requestType: data.requestType,
    locationAddress: data.locationAddress,
    userLocation: {
      x: data.userLocation.longitude,
      y: data.userLocation.latitude,
    },
    // userLocation: sql`POINT(${data.userLocation.longitude}, ${data.userLocation.latitude})`,
    status: UserStatus.PENDING,
    description: data.description,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const breakdownResult = await DB.insert(breakdownRequest)
    .values(x)
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
    userId: breakdownRequest.customerId,
    firstName: user.firstName,
    lastName: user.lastName,
    userEmail: user.email,
  })
    .from(breakdownRequest)
    .leftJoin(customer, eq(customer.id, breakdownRequest.customerId))
    .leftJoin(user, eq(user.id, customer.userId));
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
    userId: breakdownRequest.customerId,
    firstName: user.firstName,
    lastName: user.lastName,
    userEmail: user.email,
  })
    .from(breakdownRequest)
    .leftJoin(customer, eq(customer.id, breakdownRequest.customerId))
    .leftJoin(user, eq(user.id, customer.userId));
  let filteredQuery = baseQuery.orderBy(desc(breakdownRequest.updatedAt));

  if (userId) {
    // @ts-ignore
    filteredQuery = filteredQuery.where(eq(breakdownRequest.customerId, userId));
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
      eq(breakdownRequest.customerId, userId)
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
): Promise<(BreakdownAssignment & { driver: Driver; user: User })[]> => {
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
      email: user.email,
      fullName: user.firstName,
      phoneNumber: driver.phoneNumber,
    },
    user: {
      id: customer.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    },
  })
    .from(breakdownAssignment)
    .innerJoin(driver, eq(breakdownAssignment.driverId, driver.id))
    .innerJoin(
      breakdownRequest,
      eq(breakdownAssignment.requestId, breakdownRequest.id)
    )
    .innerJoin(customer, eq(breakdownRequest.customerId, customer.id))
    .innerJoin(user, eq(user.id, customer.userId))
    .where(eq(customer.id, userId));

  if (requestId) {
    // @ts-ignore
    query = query.where(eq(breakdownRequest.id, requestId));
  }

  const result = await query.orderBy(desc(breakdownAssignment.updatedAt));

  return result as unknown as (BreakdownAssignment & {
    driver: Driver;
    user: any;
  })[];
};

const updateUserStatusInBreakdownAssignment = async (
  assignmentId: number,
  userStatus: UserStatus
): Promise<BreakdownAssignment | null> => {
  const result = await DB.update(breakdownAssignment)
    .set({ status: userStatus })
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
