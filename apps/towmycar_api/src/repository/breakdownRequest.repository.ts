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
  aliasedTable,
  and,
  ne,
  sql,
  eq,
  desc,
  count,
  isNotNull,
  SQL,
 Column,
} from "@towmycar/database";
import { BreakdownRequestInput } from "../dto/breakdownRequest.dto";
import {
  BreakdownRequestStatus,
  DriverStatus,
  UserStatus,
} from "@towmycar/common";
import { ConflictError, DataBaseError } from "../utils/error";
import {
  BreakdownAssignmentDetails,
  CloseBreakdownParams,
} from "./../types/types";
import { logger } from "../utils";

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
  weight: number | null; // Change this to number | null
  status: string;
  createdAt: Date;
  userId: number;
  assignments: {
    id: number;
    driverStatus: string;
    userStatus: string;
    estimation: number | null;
    explanation: string | null;
    updatedAt: Date;
    driver: {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
      phoneNumber: string | null;
      imageUrl: string | null;
    };
  }[];
};

// Add this interface near the top with other type definitions
interface DriverProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber: string | null;
  imageUrl: string | null;
  ratings: {
    count: number;
    averageRating: number | null;
    completedJobs: number;
  };
  reviews: {
    rating: number;
    feedback: string;
    createdAt: Date;
    customer: {
      firstName: string;
      lastName: string;
      imageUrl: string | null;
    };
  }[];
}

// declare repository type
export type BreakdownRequestRepositoryType = {
  saveBreakdownRequest: (
    data: BreakdownRequestInput
  ) => Promise<BreakdownRequest>;
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
  ) => Promise<BreakdownAssignmentDetails[]>;
  getBreakdownAssignmentsByDriverIdAndRequestId: (
    driverId: number,
    requestId?: number
  ) => Promise<BreakdownAssignmentDetails | null>;
  closeBreakdownAndUpdateRating: (
    params: CloseBreakdownParams
  ) => Promise<void>;
  getBreakdownRequestById: (
    requestId: number
  ) => Promise<BreakdownRequestWithUserDetails | null>;
  getDriverRatingCount: (driverId: number) => Promise<{
    count: number;
    averageRating: number | null;
    completedJobs: number;
  }>;
  getDriverProfile: (
    driverId: number,
    requestId: number
  ) => Promise<DriverProfile | null>;
};

// Add these utility functions after the imports
function maskText(text: SQL<string> | Column<any, any, any>, visibleChars: number = 3): SQL<string> {
  return sql<string>`CASE 
    WHEN ${text} IS NULL THEN NULL
    ELSE CONCAT(SUBSTRING(${text}, 1, ${visibleChars}), REPEAT('*', GREATEST(LENGTH(${text}) - ${visibleChars}, 0)))
  END`;
}

function maskSensitiveData(
  text: SQL<string> |Column<any, any, any>, 
  isVisible: SQL<boolean>, 
  visibleChars: number = 3
): SQL<string> {
  return sql<string>`CASE 
    WHEN ${isVisible} THEN ${text}
    ELSE ${maskText(text, visibleChars)}
  END`;
}

const saveBreakdownRequest = async (data: BreakdownRequestInput) => {
  try {
    const breakdownData: Omit<BreakdownRequest, "id"> = {
      customerId: data.customerId,
      requestType: data.requestType,
      address: data.address,
      toAddress: data.toAddress,
      postCode:data.postCode,
      toPostCode:data.toPostCode,
      make: data.make,
      model: data.makeModel,
      mobileNumber: data.mobileNumber,
      userLocation: {
        x: data.userLocation.longitude,
        y: data.userLocation.latitude,
      },
      userToLocation: {
        x: data.userToLocation.longitude,
        y: data.userToLocation.latitude,
      },
      status: BreakdownRequestStatus.WAITING,
      description: data.description,
      regNo: data.regNo,
      weight: data?.weight?.toString() ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const breakdownResult = await DB.insert(breakdownRequest)
      .values(breakdownData)
      .returning();

    return breakdownResult[0];
  } catch (error) {
    console.error("Error in saveBreakdownRequest:", error);
    throw new DataBaseError(`Failed to save breakdown request: ${error}`);
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
    const driverUser = aliasedTable(user, "driver_user");

    const baseQuery = DB.select({
      id: breakdownRequest.id,
      requestType: breakdownRequest.requestType,
      description: breakdownRequest.description,
      make: breakdownRequest.make,
      makeModel: breakdownRequest.model,
      regNo: breakdownRequest.regNo,
      mobileNumber: breakdownRequest.mobileNumber,
      weight: breakdownRequest.weight,
      status: breakdownRequest.status,
      createdAt: breakdownRequest.createdAt,
      userId: breakdownRequest.customerId,
      firstName: user.firstName,
      lastName: user.lastName,
      userEmail: user.email,
      location: {
        latitude:
          sql<number>`CAST(ST_Y(${breakdownRequest.userLocation}) AS FLOAT)`.as(
            "latitude"
          ),
        longitude:
          sql<number>`CAST(ST_X(${breakdownRequest.userLocation}) AS FLOAT)`.as(
            "longitude"
          ),
      },
      toLocation: {
        latitude:
          sql<number>`CAST(ST_Y(${breakdownRequest.userToLocation}) AS FLOAT)`.as(
            "latitude"
          ),
        longitude:
          sql<number>`CAST(ST_X(${breakdownRequest.userToLocation}) AS FLOAT)`.as(
            "longitude"
          ),
      },
      assignments: sql<
        {
          id: number;
          driverStatus: string;
          userStatus: string;
          estimation: number | null;
          explanation: string | null;
          updatedAt: Date;
          driver: {
            id: number;
            email: string | null;
            firstName: string;
            lastName: string;
            phoneNumber: string | null;
            imageUrl: string | null;
          };
        }[]
      >`
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', ${breakdownAssignment.id},
              'driverStatus', ${breakdownAssignment.driverStatus},
              'userStatus', ${breakdownAssignment.userStatus},
              'estimation', ${breakdownAssignment.estimation},
              'explanation', ${breakdownAssignment.explanation},
              'updatedAt', ${breakdownAssignment.updatedAt},
              'driver', JSON_BUILD_OBJECT(
                'id', ${driver.id},
                'email', CASE WHEN ${breakdownAssignment.paymentId} IS NOT NULL THEN ${driverUser.email} ELSE NULL END,
                'firstName', CASE WHEN ${breakdownAssignment.paymentId} IS NOT NULL THEN ${driverUser.firstName} ELSE NULL END,
                'lastName', CASE WHEN ${breakdownAssignment.paymentId} IS NOT NULL THEN ${driverUser.lastName} ELSE NULL END,
                'phoneNumber', CASE WHEN ${breakdownAssignment.paymentId} IS NOT NULL THEN ${driver.phoneNumber} ELSE NULL END,
                'imageUrl', ${driverUser.imageUrl}
              )
            )
          ) FILTER (WHERE ${breakdownAssignment.id} IS NOT NULL AND ${breakdownAssignment.driverStatus} IN (${DriverStatus.QUOTED}, ${DriverStatus.ACCEPTED})),
          '[]'::json
        )
      `.as("assignments"),
    })
      .from(breakdownRequest)
      .leftJoin(customer, eq(customer.id, breakdownRequest.customerId))
      .leftJoin(user, eq(user.id, customer.userId))
      .leftJoin(
        breakdownAssignment,
        eq(breakdownAssignment.requestId, breakdownRequest.id)
      )
      .leftJoin(driver, eq(breakdownAssignment.driverId, driver.id))
      .leftJoin(driverUser, eq(driver.userId, driverUser.id));

    let filteredQuery = baseQuery;

    if (customerId) {
      //@ts-ignore
      filteredQuery = filteredQuery.where(
        eq(breakdownRequest.customerId, customerId)
      );
    }

    const paginatedQuery = filteredQuery
      .groupBy(breakdownRequest.id, user.id)
      .orderBy(desc(breakdownRequest.updatedAt))
      .limit(pageSize)
      .offset(offset);

    const requests = await paginatedQuery;

    // Convert weight to number
    const formattedRequests: BreakdownRequestWithUserDetails[] = requests.map(
      request => ({
        ...request,
        weight: request.weight ? Number(request.weight) : null,
      })
    );

    const countQuery = DB.select({
      count: sql<number>`cast(count(*) as integer)`,
    }).from(breakdownRequest);

    let filteredCountQuery = countQuery;

    if (customerId) {
      //@ts-ignore
      filteredCountQuery = filteredCountQuery.where(
        eq(breakdownRequest.customerId, customerId)
      );
    }

    const [{ count }] = await filteredCountQuery;

    return {
      requests: formattedRequests,
      totalCount: count,
    };
  } catch (error) {
    logger.error("Error in getPaginatedBreakdownRequestsByCustomerId:", error);
    throw new DataBaseError(`Failed to fetch paginated breakdown requests`);
  }
};

const updateUserStatusInBreakdownAssignment = async (
  assignmentId: number,
  userStatus: UserStatus
): Promise<BreakdownAssignment | null> => {
  try {
    // First, get the current assignment to check its requestId and driverStatus
    const currentAssignment = await DB.select({
      requestId: breakdownAssignment.requestId,
      driverStatus: breakdownAssignment.driverStatus,
    })
      .from(breakdownAssignment)
      .where(eq(breakdownAssignment.id, assignmentId))
      .limit(1);

    if (!currentAssignment.length) {
      throw new Error("Assignment not found");
    }

    const { requestId, driverStatus } = currentAssignment[0];

    // Check if trying to reject an accepted assignment
    if (
      userStatus === UserStatus.REJECTED &&
      driverStatus === DriverStatus.ACCEPTED
    ) {
      throw new ConflictError(
        "Cannot reject an assignment that has already been accepted by the driver"
      );
    }

    // If the new status is ACCEPTED, check for existing accepted assignments
    if (userStatus === UserStatus.ACCEPTED) {
      const existingAcceptedAssignment = await DB.select({
        id: breakdownAssignment.id,
      })
        .from(breakdownAssignment)
        .where(
          and(
            eq(breakdownAssignment.requestId, requestId),
            eq(breakdownAssignment.userStatus, UserStatus.ACCEPTED),
            ne(breakdownAssignment.id, assignmentId)
          )
        )
        .limit(1);

      if (existingAcceptedAssignment.length > 0) {
        throw new ConflictError(
          "Another assignment for this request has already been accepted"
        );
      }
    }

    // If no conflict, proceed with the update
    const result = await DB.update(breakdownAssignment)
      // @ts-ignore
      .set({ userStatus: userStatus })
      .where(eq(breakdownAssignment.id, assignmentId))
      .returning();

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    logger.error("Error in updateUserStatusInBreakdownAssignment:", error);
    throw new DataBaseError(`Failed to update assignment status: ${error}`);
  }
};

const getBreakdownAssignmentsByRequestId = async (
  requestId: number
): Promise<BreakdownAssignmentDetails[]> => {
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
      email: maskSensitiveData(driverUser.email, sql`${breakdownAssignment.paymentId} IS NOT NULL`),
      phoneNumber: maskSensitiveData(driver.phoneNumber, sql`${breakdownAssignment.paymentId} IS NOT NULL`),
      firstName: maskSensitiveData(driverUser.firstName, sql`${breakdownAssignment.paymentId} IS NOT NULL`),
      lastName: maskSensitiveData(driverUser.lastName, sql`${breakdownAssignment.paymentId} IS NOT NULL`),
      imageUrl: sql<string>`CASE 
        WHEN ${breakdownAssignment.paymentId} IS NOT NULL THEN ${driverUser.imageUrl} 
        ELSE NULL 
      END`
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
    .leftJoin(driver, eq(breakdownAssignment.driverId, driver.id))
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
  //@ts-ignore
  return result;
};

const getBreakdownAssignmentsByDriverIdAndRequestId = async (
  driverId: number,
  requestId?: number
): Promise<BreakdownAssignmentDetails | null> => {
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
  //@ts-ignore
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
  driverRating,
  driverFeedback,
  siteRating,
  siteFeedback,
  driverId,
}: CloseBreakdownParams): Promise<void> => {
  try {
    await DB.transaction(async tx => {
      // Update breakdown assignment status
      await tx
        .update(breakdownAssignment)
        //@ts-ignore
        .set({
          //@ts-ignore
          userStatus: UserStatus.CLOSED,
        })
        .where(eq(breakdownAssignment.requestId, requestId));

      // Update breakdown request status and return customerId
      const result = await tx
        .update(breakdownRequest)
        //@ts-ignore
        .set({ status: BreakdownRequestStatus.CLOSED })
        .where(eq(breakdownRequest.id, requestId))
        .returning({ customerId: breakdownRequest.customerId });

      const customerId = result[0]?.customerId;

      if (!customerId) {
        throw new Error(
          "Failed to retrieve customerId after updating breakdown request"
        );
      }

      //@ts-ignore
      await tx.insert(serviceRatings).values({
        requestId,
        customerId,
        driverId,
        siteRating,
        siteFeedback,
        customerRating: driverRating,
        customerFeedback: driverFeedback,
      });
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
      description: breakdownRequest.description,
      make: breakdownRequest.make,
      makeModel: breakdownRequest.model,
      regNo: breakdownRequest.regNo,
      mobileNumber: breakdownRequest.mobileNumber,
      weight: breakdownRequest.weight,
      status: breakdownRequest.status,
      createdAt: breakdownRequest.createdAt,
      userId: breakdownRequest.customerId,
      location: {
        latitude:
          sql<number>`CAST(ST_Y(${breakdownRequest.userLocation}) AS FLOAT)`.as(
            "latitude"
          ),
        longitude:
          sql<number>`CAST(ST_X(${breakdownRequest.userLocation}) AS FLOAT)`.as(
            "longitude"
          ),
      },
      toLocation: {
        latitude:
          sql<number>`CAST(ST_Y(${breakdownRequest.userToLocation}) AS FLOAT)`.as(
            "latitude"
          ),
        longitude:
          sql<number>`CAST(ST_X(${breakdownRequest.userToLocation}) AS FLOAT)`.as(
            "longitude"
          ),
      },
      assignments: sql<
        {
          id: number;
          driverStatus: string;
          userStatus: string;
          estimation: number | null;
          explanation: string | null;
          updatedAt: Date;
          driver: {
            id: number;
            email: string;
            firstName: string;
            lastName: string;
            phoneNumber: string | null;
            imageUrl: string | null;
          };
        }[]
      >`
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', ${breakdownAssignment.id},
              'driverStatus', ${breakdownAssignment.driverStatus},
              'userStatus', ${breakdownAssignment.userStatus},
              'estimation', ${breakdownAssignment.estimation},
              'explanation', ${breakdownAssignment.explanation},
              'updatedAt', ${breakdownAssignment.updatedAt},
              'driver', JSON_BUILD_OBJECT(
                'id', ${driver.id},
                'email', ${maskSensitiveData(user.email, sql`${breakdownAssignment.paymentId} IS NOT NULL`)},
                'firstName', ${maskSensitiveData(user.firstName, sql`${breakdownAssignment.paymentId} IS NOT NULL`)},
                'lastName', ${maskSensitiveData(user.lastName, sql`${breakdownAssignment.paymentId} IS NOT NULL`)},
                'phoneNumber', ${maskSensitiveData(driver.phoneNumber, sql`${breakdownAssignment.paymentId} IS NOT NULL`)},
                'imageUrl', CASE 
                  WHEN ${breakdownAssignment.paymentId} IS NOT NULL THEN ${user.imageUrl} 
                  ELSE NULL 
                END
              )
            )
          ) FILTER (WHERE ${breakdownAssignment.id} IS NOT NULL),
          '[]'::json
        )
      `.as("assignments"),
    })
      .from(breakdownRequest)
      .leftJoin(
        breakdownAssignment,
        eq(breakdownAssignment.requestId, breakdownRequest.id)
      )
      .leftJoin(driver, eq(breakdownAssignment.driverId, driver.id))
      .leftJoin(user, eq(driver.userId, user.id))
      .where(eq(breakdownRequest.id, requestId))
      .groupBy(breakdownRequest.id)
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const breakdownRequestWithDetails: BreakdownRequestWithUserDetails = {
      ...result[0],
      weight: result[0].weight ? Number(result[0].weight) : null,
    };

    return breakdownRequestWithDetails;
  } catch (error) {
    console.error("Error in getBreakdownRequestById:", error);
    throw new DataBaseError(
      `Failed to fetch breakdown request by IDs: ${error}`
    );
  }
};

const getDriverRatingCount = async (
  driverId: number
): Promise<{
  count: number;
  averageRating: number | null;
  completedJobs: number;
}> => {
  try {
    // Get ratings data
    const ratingsResult = await DB.select({
      count: count(),
      averageRating: sql<number>`CAST(AVG(${serviceRatings.customerRating}) AS FLOAT)`,
    })
      .from(serviceRatings)
      .where(and(eq(serviceRatings.driverId, driverId)));

    // Get completed jobs count
    const completedJobsResult = await DB.select({
      completedJobs: count(),
    })
      .from(breakdownAssignment)
      .where(
        and(
          eq(breakdownAssignment.driverId, driverId),
          eq(breakdownAssignment.isCompleted, true),
          eq(breakdownAssignment.driverStatus, DriverStatus.CLOSED)
        )
      );

    return {
      count: ratingsResult[0].count,
      averageRating: ratingsResult[0].averageRating,
      completedJobs: completedJobsResult[0].completedJobs,
    };
  } catch (error) {
    console.error("Error in getDriverRatingCount:", error);
    throw new DataBaseError(`Failed to fetch driver statistics: ${error}`);
  }
};

// Update the getDriverProfile function to accept requestId
const getDriverProfile = async (
  driverId: number,
  requestId: number
): Promise<DriverProfile | null> => {
  try {
    // First check if there's an accepted assignment for this request and driver
    const assignment = await DB.select({
      userStatus: breakdownAssignment.userStatus,
      driverStatus: breakdownAssignment.driverStatus,
      paymentId: breakdownAssignment.paymentId,
    })
      .from(breakdownAssignment)
      .where(
        and(
          eq(breakdownAssignment.driverId, driverId),
          eq(breakdownAssignment.requestId, requestId)
        )
      )
      .limit(1);

    const isAccepted = assignment?.[0]?.paymentId !== null; // &&
    // assignment?.[0]?.userStatus === UserStatus.ACCEPTED &&
    // assignment?.[0]?.driverStatus === DriverStatus.ACCEPTED;

    // Get driver basic info with conditional contact details
    const driverInfo = await DB.select({
      id: driver.id,
      firstName: maskSensitiveData(user.firstName, sql`${isAccepted}`),
      lastName: maskSensitiveData(user.lastName, sql`${isAccepted}`),
      email: maskSensitiveData(user.email, sql`${isAccepted}`),
      phoneNumber: maskSensitiveData(driver.phoneNumber, sql`${isAccepted}`),
      imageUrl: sql<string>`CASE 
        WHEN ${isAccepted} THEN ${user.imageUrl}
        ELSE NULL 
      END`,
    })
      .from(driver)
      .innerJoin(user, eq(driver.userId, user.id))
      .where(eq(driver.id, driverId))
      .limit(1);

    if (!driverInfo.length) {
      return null;
    }

    // Get ratings statistics
    const ratingsResult = await DB.select({
      count: count(),
      averageRating: sql<number>`CAST(AVG(${serviceRatings.customerRating}) AS FLOAT)`,
    })
      .from(serviceRatings)
      .where(eq(serviceRatings.driverId, driverId));

    // Get completed jobs count
    const completedJobsResult = await DB.select({
      completedJobs: count(),
    })
      .from(breakdownAssignment)
      .where(
        and(
          eq(breakdownAssignment.driverId, driverId),
          eq(breakdownAssignment.isCompleted, true),
          eq(breakdownAssignment.driverStatus, DriverStatus.CLOSED)
        )
      );

    // Get reviews
    const reviews = await DB.select({
      rating: serviceRatings.customerRating,
      feedback: serviceRatings.customerFeedback,
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
      .where(
        and(
          eq(serviceRatings.driverId, driverId),
          isNotNull(serviceRatings.customerRating),
          isNotNull(serviceRatings.customerFeedback)
        )
      )
      .orderBy(desc(serviceRatings.createdAt))
      .limit(10); // Limit to last 10 reviews

    return {
      ...driverInfo[0],
      ratings: {
        count: ratingsResult[0].count,
        averageRating: ratingsResult[0].averageRating,
        completedJobs: completedJobsResult[0].completedJobs,
      },
      reviews: reviews,
    };
  } catch (error) {
    console.error("Error in getDriverProfile:", error);
    throw new DataBaseError(`Failed to fetch driver profile: ${error}`);
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
  getDriverRatingCount,
  getDriverProfile,
};
