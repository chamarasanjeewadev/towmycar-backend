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
} from "@towmycar/database";
import { BreakdownRequestInput } from "../dto/breakdownRequest.dto";
import { aliasedTable, and, ne, sql } from "drizzle-orm";
import { UserStatus, BreakdownRequestStatus } from "../enums";
import { eq, desc, isNotNull } from "drizzle-orm";
import { DriverStatus } from "@towmycar/database/enums";

// Add this type definition
type BreakdownRequestWithUserDetails = {
  id: number;
  requestType: string;
  location: { latitude: number; longitude: number } | null;
  description: string | null;
  make: string | null;
  makeModel: string | null;
  regNo: string | null;
  mobileNumber: string | null;
  weight: number | null;
  status: string;
  createdAt: Date;
  userId: number;
};

type CloseBreakdownParams = {
  requestId: number;
  customerId: number;
  customerRating: number | null;
  customerFeedback: string | null;
  siteRating: number | null;
  siteFeedback: string | null;
};

// declare repository type
export type BreakdownRequestRepositoryType = {
  saveBreakdownRequest: (data: BreakdownRequestInput) => Promise<number>;
  getPaginatedBreakdownRequestsByCustomerId: (
    page: number,
    pageSize: number,
    customerId?: number
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
  getBreakdownRequestById: (
    requestId: number
  ) => Promise<BreakdownRequestWithUserDetails | null>;
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
      make: data.make,
      model: data.makeModel,
      mobileNumber: data.mobileNumber,
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
  } catch (error) {
    console.log("error occured at breakdown repo", error);
    throw error;
  }
};

const getPaginatedBreakdownRequestsByCustomerId = async (
  page: number,
  pageSize: number,
  customerId?: number
): Promise<{
  requests: BreakdownRequestWithUserDetails[];
  totalCount: number;
}> => {
  const offset = (page - 1) * pageSize;
  try {
    const baseQuery = DB.select({
      id: breakdownRequest.id,
      requestType: breakdownRequest.requestType,
      location: breakdownRequest.userLocation,
      description: breakdownRequest.description,
      make: breakdownRequest.make,
      makeModel: breakdownRequest.model,
      regNo: breakdownRequest.regNo,
      mobilNumber: breakdownRequest.mobileNumber,
      weight: breakdownRequest.weight,
      status: breakdownRequest.status,
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
      filteredQuery = filteredQuery.where(
        eq(breakdownRequest.customerId, customerId)
      );
    }

    const requests = await filteredQuery.limit(pageSize).offset(offset);

    const countQuery = DB.select({
      count: sql<number>`cast(count(*) as integer)`,
    }).from(breakdownRequest);

    let filteredCountQuery = countQuery;

    if (customerId) {
      filteredCountQuery = filteredCountQuery.where(
        eq(breakdownRequest.customerId, customerId)
      );
    }

    const [{ count }] = await filteredCountQuery;

    return {
      requests: requests.map(request => ({
        ...request,
        weight: request.weight ? Number(request.weight) : null,
        location: request.location
          ? {
              latitude: request.location.x,
              longitude: request.location.y,
            }
          : null,
      })),
      totalCount: count,
    };
  } catch (error) {
    console.error("Error in getPaginatedBreakdownRequestsByCustomerId:", error);
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
    .where(
      and(
        eq(breakdownAssignment.requestId, requestId),
        ne(breakdownAssignment.driverStatus, DriverStatus.PENDING)
      )
    )
    .orderBy(desc(breakdownAssignment.updatedAt));

  return result as (BreakdownAssignment & {
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
const closeBreakdownAndUpdateRating = async ({
  requestId,
  customerId,
  customerRating,
  customerFeedback,
  siteRating,
  siteFeedback,
}: CloseBreakdownParams): Promise<void> => {
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
      // const assignments = await tx
      //   .select({
      //     driverId: breakdownAssignment.driverId,
      //     customerId: breakdownRequest.customerId,
      //   })
      //   .from(breakdownAssignment)
      //   .innerJoin(
      //     breakdownRequest,
      //     eq(breakdownAssignment.requestId, breakdownRequest.id)
      //   )
      //   .where(eq(breakdownAssignment.requestId, requestId));

      // if (assignments.length === 0) {
      //   throw new Error("No assignments found for this request");
      // }

      console.log("serviceRatings:", serviceRatings);
      // for (const assignment of assignments) {
        await tx.insert(serviceRatings).values({
          requestId,
          customerId,
          siteRating,
          siteFeedback,
          customerRating,
          customerFeedback,
        });
        // .onConflictDoUpdate({
        //   target: serviceRatings.id, // Assuming 'id' is the primary key
        //   set: {
        //     customerRating,
        //     customerFeedback,
        //     siteRating,
        //     siteFeedback,
        //     updatedAt: new Date(),
        //   },
        // });
      // }
    });
  } catch (error) {
    console.error("Error in closeBreakdownAndUpdateRating:", error);
    throw error;
  }
};

const getBreakdownRequestById = async (
  requestId: number
): Promise<BreakdownRequestWithUserDetails | null> => {
  try {
    const result = await DB.select({
      id: breakdownRequest.id,
      requestType: breakdownRequest.requestType,
      location: breakdownRequest.userLocation,
      description: breakdownRequest.description,
      make: breakdownRequest.make,
      makeModel: breakdownRequest.model,
      regNo: breakdownRequest.regNo,
      mobileNumber: breakdownRequest.mobileNumber,
      weight: breakdownRequest.weight,
      status: breakdownRequest.status,
      createdAt: breakdownRequest.createdAt,
      userId: breakdownRequest.customerId,
    })
      .from(breakdownRequest)
      .where(eq(breakdownRequest.id, requestId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const request = result[0];
    return {
      ...request,
      weight: request.weight ? Number(request.weight) : null,
      location: request.location
        ? {
            latitude: request.location.y, // Note: y is latitude
            longitude: request.location.x, // Note: x is longitude
          }
        : null,
    };
  } catch (error) {
    console.error("Error in getBreakdownRequestById:", error);
    throw new Error("Failed to fetch breakdown request by ID");
  }
};

export const BreakdownRequestRepository: BreakdownRequestRepositoryType = {
  saveBreakdownRequest,
  getPaginatedBreakdownRequestsByCustomerId,
  updateUserStatusInBreakdownAssignment,
  getBreakdownAssignmentsByRequestId,
  getBreakdownAssignmentsByDriverIdAndRequestId,
  closeBreakdownAndUpdateRating,
  getBreakdownRequestById,
};
