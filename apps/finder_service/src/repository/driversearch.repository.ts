import {
  DB,
  driver,
  breakdownAssignment,
  breakdownRequest,
  customer,
  user,
  Customer,
  eq,
  sql,
} from "@towmycar/database";
import { DriverStatus, UserStatus } from "@towmycar/common";
import { UserWithCustomer } from "../types/types";
// Define a type for the nearby driver data
export type NearbyDriver = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

export type DriverSearchRepositoryType = {
  findNearbyDrivers: (
    latitude: number,
    longitude: number
  ) => Promise<NearbyDriver[]>;

  updateDriverRequests: (
    requestId: number,
    nearbyDrivers: NearbyDriver[]
  ) => Promise<void>;

  getUserByCustomerId: (customerId: number) => Promise<UserWithCustomer | null>;
};

// Add this import

// Add this type definition


// @ts-nocheck
const findNearbyDrivers = async (
  latitude: number,
  longitude: number
): Promise<NearbyDriver[]> => {
  try {
    const nearbyDrivers = await DB.select({
      id: driver.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: driver.phoneNumber,
      vehicleType: driver.vehicleType,
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
        sql`ST_DWithin(
          ${driver.primaryLocation}::geography,
          ST_MakePoint(${longitude}, ${latitude})::geography,
          ${driver.serviceRadius} * 1000
        )`
      )
      .orderBy(sql`distance`);
    console.log("nearbyDrivers", nearbyDrivers);
    // Use a type assertion here
    return nearbyDrivers as unknown as NearbyDriver[];
  } catch (error) {
    console.error("Error in findNearbyDrivers:", error);
    throw error; // Re-throw the error after logging
  }
};

const updateDriverRequests = async (
  requestId: number,
  nearbyDrivers: NearbyDriver[]
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
          }))
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

    return result[0];
  } catch (error) {
    console.error("Error in getUserByCustomerId:", error);
    if (error) {
      throw error;
    } else {
      throw new Error(
        `Failed to get user for customerId ${customerId}{error: ${error}}`
      );
    }
  }
};

// Add this to your exported DriverSearchRepository object
export const DriverSearchRepository: DriverSearchRepositoryType = {
  findNearbyDrivers,
  updateDriverRequests,
  getUserByCustomerId,
};
