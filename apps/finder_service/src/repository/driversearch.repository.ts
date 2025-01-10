import {
  DB,
  driver,
  breakdownAssignment,
  breakdownRequest,
  customer,
  user,
  eq,
  sql,
  and,
} from "@towmycar/database";
import {
  DriverApprovalStatus,
  DriverAvailabilityStatus,
  DriverStatus,
  logger,
  NearbyDriver,
  UserStatus,
  UserWithCustomer,
} from "@towmycar/common";
import { BreakdownRequestWithUserDetails } from "../types/types";
// Define a type for the nearby driver data

export type DriverSearchRepositoryType = {
  findNearbyDrivers: (
    latitude: number,
    longitude: number,
    toLatitude: number | null,
    toLongitude: number | null,
    weight: string | number | null,
  ) => Promise<NearbyDriver[]>;

  updateDriverRequests: (
    requestId: number,
    nearbyDrivers: NearbyDriver[],
  ) => Promise<void>;

  getUserByCustomerId: (customerId: number) => Promise<UserWithCustomer | null>;
  getBreakdownRequestById: (
    requestId: number,
  ) => Promise<BreakdownRequestWithUserDetails | null>;
};

// @ts-nocheck
const findNearbyDrivers = async (
  latitude: number,
  longitude: number,
  toLatitude: number | null,
  toLongitude: number | null,
  weight: string | number | null,
): Promise<NearbyDriver[]> => {
  try {
    const weightCondition = weight
      ? sql`AND CAST(${driver.maxWeight} AS DECIMAL) >= CAST(${weight} AS DECIMAL)`
      : sql``;

    const nearbyDrivers = await DB.select({
      id: driver.id,
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: driver.phoneNumber,
      vehicleType: driver.vehicleType,
      vehicleWeightCapacity: driver.maxWeight,
      distance: sql`
        ST_Distance(
          ${driver.primaryLocation}::geography,
          ST_MakePoint(${longitude}, ${latitude})::geography
        ) / 1000
      `.as("distance"),
    })
      .from(driver)
      .leftJoin(user, eq(driver.userId, user.id))
      .where(
        and(
          // eq(driver.approvalStatus, DriverApprovalStatus.APPROVED), //Note: Users who are not approved must get requests
          eq(driver.availabilityStatus, DriverAvailabilityStatus.AVAILABLE),
          sql`ST_DWithin(
          ${driver.primaryLocation}::geography,
          ST_MakePoint(${longitude}, ${latitude})::geography,
          ${driver.serviceRadius} * 1000
        ) ${weightCondition}`,
        ),
      )
      .orderBy(sql`distance`);
    logger.info("nearbyDrivers", nearbyDrivers);
    console.log("nearbyDrivers", nearbyDrivers);
    // Use a type assertion here
    return nearbyDrivers as unknown as NearbyDriver[];
  } catch (error) {
    console.error("Error in findNearbyDrivers:", error);
    throw error; // Re-throw the error after logging
  }
};

// @ts-nocheck
const findNearbyDriversAroundFromAndToLocations = async (
  latitude: number,
  longitude: number,
  toLatitude: number | null,
  toLongitude: number | null,
  weight: number,
): Promise<NearbyDriver[]> => {
  try {
    const distanceCalc =
      toLatitude && toLongitude
        ? sql`
          LEAST(
            ST_Distance(
              unique_drivers.primary_location::geography,
              ST_MakePoint(${longitude}, ${latitude})::geography
            ),
            ST_Distance(
              unique_drivers.primary_location::geography,
              ST_MakePoint(${toLongitude}, ${toLatitude})::geography
            )
          ) / 1000
        `
        : sql`
          ST_Distance(
            unique_drivers.primary_location::geography,
            ST_MakePoint(${longitude}, ${latitude})::geography
          ) / 1000
        `;

    const locationFilter =
      toLatitude && toLongitude
        ? sql`(
          ST_DWithin(
            ${driver.primaryLocation}::geography,
            ST_MakePoint(${longitude}, ${latitude})::geography,
            ${driver.serviceRadius} * 1000
          ) OR
          ST_DWithin(
            ${driver.primaryLocation}::geography,
            ST_MakePoint(${toLongitude}, ${toLatitude})::geography,
            ${driver.serviceRadius} * 1000
          )
        )`
        : sql`
          ST_DWithin(
            ${driver.primaryLocation}::geography,
            ST_MakePoint(${longitude}, ${latitude})::geography,
            ${driver.serviceRadius} * 1000
          )
        `;

    const weightCondition = weight
      ? sql`AND CAST(unique_drivers.vehicle_weight_capacity AS DECIMAL) >= CAST(${weight} AS DECIMAL)`
      : sql``;

    const nearbyDrivers = await DB.select({
      id: sql`unique_drivers.id`,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: sql`unique_drivers.phone_number`,
      vehicleType: sql`unique_drivers.vehicle_type`,
      vehicleWeightCapacity: sql`unique_drivers.vehicle_weight_capacity`,
      distance: distanceCalc.as("distance"),
    })
      .from(
        sql`(
        SELECT DISTINCT ON (${driver.id}) 
          ${driver.id},
          ${driver.userId},
          ${driver.phoneNumber},
          ${driver.vehicleType},
          ${driver.maxWeight},
          ${driver.primaryLocation},
          ${driver.serviceRadius}
        FROM ${driver}
        WHERE ${locationFilter} ${weightCondition}
      ) as unique_drivers`,
      )
      .innerJoin(user, eq(sql`unique_drivers.user_id`, user.id))
      .orderBy(sql`distance`);

    return nearbyDrivers as unknown as NearbyDriver[];
  } catch (error) {
    console.error("Error in findNearbyDrivers:", error);
    throw error;
  }
};

const updateDriverRequests = async (
  requestId: number,
  nearbyDrivers: NearbyDriver[],
): Promise<void> => {
  const now = new Date();

  try {
    console.log("nearbyDrivers, before transaction", nearbyDrivers);
    await DB.transaction(async tx => {
      await tx
        .insert(breakdownAssignment)
        .values(
          nearbyDrivers.map(driver => ({
            requestId,
            driverId: driver.id,
            driverStatus: DriverStatus.PENDING,
            userStatus: UserStatus.PENDING,
            assignedAt: now,
            createdAt: now,
            updatedAt: now,
          })),
        )
        .onConflictDoUpdate({
          target: [breakdownAssignment.requestId, breakdownAssignment.driverId],
          set: {
            updatedAt: now,
          },
        });
    });
    console.log("nearbyDrivers, after transaction", nearbyDrivers);
  } catch (error) {
    console.error("Error in updateDriverRequests:", error);
    throw error; // Re-throw the error after logging
  }
};

// Add this function to your repository implementation
const getUserByCustomerId = async (customerId: number) => {
  try {
    console.log("Getting customer info for customerId:", customerId);
    const result = await DB.select({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobileNumber: customer.mobileNumber,
    })
      .from(customer)

      .innerJoin(user, eq(customer.userId, user.id))
      .where(eq(customer.id, customerId))
      .limit(1);

    console.log("Query result:", result);

    if (result.length === 0) {
      console.log("No user found for customerId:", customerId);
      return null;
    }

    return result[0] as UserWithCustomer;
  } catch (error) {
    console.error("Error in getUserByCustomerId:", error);
    if (error) {
      throw error;
    } else {
      throw new Error(
        `Failed to get user for customerId ${customerId}{error: ${error}}`,
      );
    }
  }
};

const getBreakdownRequestById = async (
  requestId: number,
): Promise<BreakdownRequestWithUserDetails> => {
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
      customerId: breakdownRequest.customerId,
      location: {
        latitude:
          sql<number>`CAST(ST_Y(${breakdownRequest.userLocation}) AS FLOAT)`.as(
            "latitude",
          ),
        longitude:
          sql<number>`CAST(ST_X(${breakdownRequest.userLocation}) AS FLOAT)`.as(
            "longitude",
          ),
      },
      toLocation: {
        latitude:
          sql<number>`CAST(ST_Y(${breakdownRequest.userToLocation}) AS FLOAT)`.as(
            "latitude",
          ),
        longitude:
          sql<number>`CAST(ST_X(${breakdownRequest.userToLocation}) AS FLOAT)`.as(
            "longitude",
          ),
      },
    })
      .from(breakdownRequest)
      .leftJoin(
        breakdownAssignment,
        eq(breakdownAssignment.requestId, breakdownRequest.id),
      )
      .leftJoin(driver, eq(breakdownAssignment.driverId, driver.id))
      .leftJoin(user, eq(driver.userId, user.id))
      .where(eq(breakdownRequest.id, requestId));

    if (!result?.length) {
      throw new Error(`Breakdown request not found for ID: ${requestId}`);
    }

    return result[0];
  } catch (error) {
    console.error("Error in getBreakdownRequestById:", error);
    throw error instanceof Error
      ? error
      : new Error(`Failed to fetch breakdown request by ID: ${requestId}`);
  }
};

// Add this to your exported DriverSearchRepository object
export const DriverSearchRepository: DriverSearchRepositoryType = {
  findNearbyDrivers,
  updateDriverRequests,
  getUserByCustomerId,
  getBreakdownRequestById,
};
