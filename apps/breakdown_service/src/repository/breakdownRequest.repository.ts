// @ts-nocheck

import {
  DB,
  breakdownRequest,
  BreakdownRequest,
  serviceRatings,
  breakdownAssignment,
  customer,
  user,
  driver,
  Driver,
  BreakdownAssignment,
  User,
} from "@breakdownrescue/database";
import { BreakdownRequestInput } from "../dto/breakdownRequest.dto";
import { aliasedTable, sql } from "drizzle-orm";
import { UserStatus, BreakdownRequestStatus } from "../enums";
import { eq, desc } from "drizzle-orm";

// Add this type definition
type BreakdownRequestWithUserDetails = {
  id: number;
  requestType: string;
  location: string;
  description: string | null;
  status: string;
  regNo: string | null; // Add this line
  weight: number | null; // Add this line
  userId: number;
  firstName: string | null;
  lastName: string | null;
  userEmail: string | null;
};

type CloseBreakdownParams = {
  requestId: number;
  customerRating: number;
  customerFeedback: string;
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
    customerId?: number,
    requestId?: number
  ) => Promise<{
    requests: BreakdownRequestWithUserDetails[];
    totalCount: number;
  }>;

  updateUserStatusInBreakdownAssignment: (
    // userId: number,
    assignmentId: number,
    userStatus: UserStatus
  ) => Promise<BreakdownAssignment | null>;
  getBreakdownAssignmentsByRequestId: (
    requestId: number
  ) => Promise<(BreakdownAssignment & { driver: Driver; user: User })[]>;
  getBreakdownAssignmentsByDriverIdAndRequestId: (
    driverId: number,
    requestId?: number
  ) => Promise<
    (BreakdownAssignment & { driver: Driver; customer: User }) | null
  >;
  closeBreakdownAndUpdateRating: (
    params: CloseBreakdownParams
  ) => Promise<void>;
};

const saveBreakdownRequest = async (
  data: BreakdownRequestInput
): Promise<number> => {
  //@ts-ignore
  try {
    const x: BreakdownRequest = {
      // id: 0,
      customerId: data.customerId,
      requestType: data.requestType,
      address: data.address,
      userLocation: {
        x: data.userLocation.longitude,
        y: data.userLocation.latitude,
      },
      status: BreakdownRequestStatus.WAITING,
      description: data.description,
      regNo: data.regNo,
      weight: data?.weight?.toString() ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const breakdownResult = await DB.insert(breakdownRequest)
      .values(x)
      .returning({ id: breakdownRequest.id });

    return breakdownResult[0].id;
  } catch (error: Error) {
    console.log("error occured at breakdown repo", error);
    throw error;
  }
};

const getAllBreakdownRequestsWithUserDetails = async (): Promise<
  BreakdownRequestWithUserDetails[]
> => {
  const results = await DB.select({
    id: breakdownRequest.id,
    requestType: breakdownRequest.requestType,
    location: breakdownRequest.address,
    description: breakdownRequest.description,
    status: breakdownRequest.status,
    regNo: breakdownRequest.regNo,
    weight: breakdownRequest.weight,
    userId: breakdownRequest.customerId,
    firstName: user.firstName,
    lastName: user.lastName,
    userEmail: user.email,
  })
    .from(breakdownRequest)
    .leftJoin(customer, eq(customer.id, breakdownRequest.customerId))
    .leftJoin(user, eq(user.id, customer.userId));

  return results.map(result => ({
    ...result,
    weight: result.weight ? Number(result.weight) : null,
  }));
};

const getPaginatedBreakdownRequestsWithUserDetails = async (
  page: number,
  pageSize: number,
  customerId?: number,
  requestId?: number
): Promise<{
  requests: BreakdownRequestWithUserDetails[];
  totalCount: number;
}> => {
  console.log("hit repo..", customerId, requestId);
  const offset = (page - 1) * pageSize;

  try {
    const baseQuery = DB.select({
      id: breakdownRequest.id,
      requestType: breakdownRequest.requestType,
      location: breakdownRequest.address,
      description: breakdownRequest.description,
      status: breakdownRequest.status,
      regNo: breakdownRequest.regNo ?? null, // Provide null as default
      weight: breakdownRequest.weight ?? null, // Provide null as default
      createdAt: breakdownRequest.createdAt,
      userId: breakdownRequest.customerId,
      firstName: user.firstName,
      lastName: user.lastName,
      userEmail: user.email,
    })
      .from(breakdownRequest)
      .leftJoin(customer, eq(customer.id, breakdownRequest.customerId))
      .leftJoin(user, eq(user.id, customer.userId));

    let filteredQuery = baseQuery.orderBy(desc(breakdownRequest.updatedAt));

    if (customerId) {
      // @ts-ignore
      filteredQuery = filteredQuery.where(
        eq(breakdownRequest.customerId, customerId)
      );
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

    if (customerId) {
      // @ts-ignore
      filteredCountQuery = filteredCountQuery.where(
        eq(breakdownRequest.customerId, customerId)
      );
    }

    if (requestId) {
      // @ts-ignore
      filteredCountQuery = filteredCountQuery.where(
        eq(breakdownRequest.id, requestId)
      );
    }

    const [{ count }] = await filteredCountQuery;

    return {
      requests: requests.map(request => ({
        ...request,
        weight: request.weight ? Number(request.weight) : null,
      })),
      totalCount: count,
    };
  } catch (error) {
    console.error(
      "Error in getPaginatedBreakdownRequestsWithUserDetails:",
      error
    );
    throw new Error(
      "Failed to fetch paginated breakdown requests with user details"
    );
  }
};

const updateUserStatusInBreakdownAssignment = async (
  assignmentId: number,
  userStatus: UserStatus
): Promise<BreakdownAssignment | null> => {
  // @ts-ignore
  const result = await DB.update(breakdownAssignment)
    // @ts-ignore
    .set({ userStatus: userStatus })
    .where(eq(breakdownAssignment.id, assignmentId))
    .returning();

  return result.length > 0 ? result[0] : null;
};

const getBreakdownAssignmentsByRequestId = async (
  requestId: number
): Promise<(BreakdownAssignment & { driver: Driver; user: User })[]> => {
  const driverUser = aliasedTable(user, "driver_user");
  const result = await DB.select({
    id: breakdownAssignment.id,
    requestId: breakdownAssignment.requestId,
    driverStatus: breakdownAssignment.driverStatus,
    userStatus: breakdownAssignment.userStatus,
    estimation: breakdownAssignment.estimation,
    explanation: breakdownAssignment.explanation,
    updatedAt: breakdownAssignment.updatedAt,

    driver: {
      id: driver.id,
      email: driverUser.email,
      firstName: driverUser.firstName,
      lastName: driverUser.lastName,
      phoneNumber: driver.phoneNumber,
      imageUrl: driverUser.imageUrl,
    },
    customer: {
      id: customer.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      imageUrl: user.imageUrl,
    },
  })
    .from(breakdownAssignment)
    .innerJoin(driver, eq(breakdownAssignment.driverId, driver.id))
    .innerJoin(
      breakdownRequest,
      eq(breakdownAssignment.requestId, breakdownRequest.id)
    )
    .leftJoin(customer, eq(breakdownRequest.customerId, customer.id))
    .leftJoin(user, eq(customer.userId, user.id))
    .leftJoin(driverUser, eq(driverUser.id, driver.userId))
    .where(eq(breakdownAssignment.requestId, requestId))
    .orderBy(desc(breakdownAssignment.updatedAt));

  return result as unknown as (BreakdownAssignment & {
    driver: Driver;
    user: User;
  })[];
};

const getBreakdownAssignmentsByDriverIdAndRequestId = async (
  driverId: number,
  requestId?: number
): Promise<
  (BreakdownAssignment & { driver: Driver; customer: User }) | null
> => {
  let query = DB.select({
    id: breakdownAssignment.id,
    requestId: breakdownAssignment.requestId,
    status: breakdownAssignment.driverStatus,
    userStatus: breakdownAssignment.userStatus,
    estimation: breakdownAssignment.estimation,
    explanation: breakdownAssignment.explanation,
    updatedAt: breakdownAssignment.updatedAt,

    driver: {
      id: driver.id,
      email: user.email,
      fullName: user.firstName,
      phoneNumber: driver.phoneNumber,
    },
    customer: {
      id: customer.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    },
  })
    .from(breakdownAssignment)
    .innerJoin(driver, eq(breakdownAssignment.driverId, driver.id))
    .innerJoin(user, eq(driver.userId, user.id))
    .innerJoin(
      breakdownRequest,
      eq(breakdownAssignment.requestId, breakdownRequest.id)
    )
    .innerJoin(customer, eq(breakdownRequest.customerId, customer.id))
    .where(eq(driver.id, driverId));

  if (requestId) {
    // @ts-ignore
    query = query.where(eq(breakdownAssignment.requestId, requestId));
  }

  const result = await query
    .orderBy(desc(breakdownAssignment.updatedAt))
    .limit(1);

  return result.length > 0
    ? (result?.[0] as unknown as BreakdownAssignment & {
        driver: Driver;
        customer: User;
      })
    : null;
};

// Update the method implementation
const closeBreakdownAndUpdateRating = async (
  params: CloseBreakdownParams
): Promise<void> => {
  const { requestId, customerRating, customerFeedback } = params;

  try {
    await DB.transaction(async tx => {
      await tx
        .update(breakdownAssignment)
        .set({
          userStatus: UserStatus.CLOSED as string,
        })
        .where(eq(breakdownAssignment.requestId, requestId));

      await tx
        .update(breakdownRequest)
        .set({ status: UserStatus.CLOSED as string })
        .where(eq(breakdownRequest.id, requestId));

      // Get the customer ID and all driver IDs associated with this request
      const assignments = await tx
        .select({
          driverId: breakdownAssignment.driverId,
          customerId: breakdownRequest.customerId,
        })
        .from(breakdownAssignment)
        .innerJoin(
          breakdownRequest,
          eq(breakdownAssignment.requestId, breakdownRequest.id)
        )
        .where(eq(breakdownAssignment.requestId, requestId));

      if (assignments.length === 0) {
        throw new Error("No assignments found for this request");
      }

      const customerId = assignments[0].customerId;
      console.log("serviceRatings:", serviceRatings);
      // Update or insert service ratings for all assignments
      for (const assignment of assignments) {
        await tx
          .insert(serviceRatings)
          .values({
            requestId,
            customerId,
            driverId: assignment?.driverId,
            customerRating,
            customerFeedback,
          })
          .onConflictDoUpdate({
            target: serviceRatings.id, // Assuming 'id' is the primary key
            set: {
              customerRating,
              customerFeedback,
              updatedAt: new Date(),
            },
          });
      }
    });
  } catch (error) {
    console.error("Error in closeBreakdownAndUpdateRating:", error);
    throw error;
  }
};

export const BreakdownRequestRepository: BreakdownRequestRepositoryType = {
  saveBreakdownRequest,
  getAllBreakdownRequestsWithUserDetails,
  getPaginatedBreakdownRequestsWithUserDetails,
  updateUserStatusInBreakdownAssignment,
  getBreakdownAssignmentsByRequestId,
  getBreakdownAssignmentsByDriverIdAndRequestId,
  closeBreakdownAndUpdateRating,
};
