// @ts-nocheck
import { DB } from "database";
import { driver, breakdownAssignment } from "database";
import { sql, eq, and } from "drizzle-orm";
import { DriverStatus } from "../enums";
// Define a type for the nearby driver data
export type NearbyDriver = {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  vehicleType: string;
  distance: number;
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
};

// @ts-nocheck
const findNearbyDrivers = async (
  latitude: number,
  longitude: number
): Promise<NearbyDriver[]> => {
  try {
    const nearbyDrivers = await DB.select({
      id: driver.id,
      fullName: driver.fullName,
      email: driver.email,
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
      // Insert breakdown assignments
      await tx.insert(breakdownAssignment).values(
        nearbyDrivers.map(driver => ({
          requestId,
          driverId: driver.id,
          status: DriverStatus.PENDING,
          assignedAt: now,
          createdAt: now,
          updatedAt: now,
        }))
      );

    });
    console.log("nearbyDrivers, after transaction", nearbyDrivers);
  } catch (error) {
    console.error("Error in updateDriverRequests:", error);
    throw error; // Re-throw the error after logging
  }
};


export const DriverSearchRepository: DriverSearchRepositoryType = {
  findNearbyDrivers,
  updateDriverRequests,
};
