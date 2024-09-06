import { DB } from "../db/db.connection";
import { breakdownRequest, userProfile, driver } from "../db/schema/schema";
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
  getAllBreakdownRequestsWithUserDetails: () => Promise<BreakdownRequestWithUserDetails[]>;
  findNearbyDrivers: (latitude: number, longitude: number) => Promise<any[]>;
};

const findNearbyDrivers = async (latitude: number, longitude: number): Promise<any[]> => {
  const nearbyDrivers = await DB.select({
    id: driver.id,
    fullName: driver.fullName,
    email: driver.email,
    phoneNumber: driver.phoneNumber,
    vehicleType: driver.vehicleType,
    distance: sql<number>`
      ST_Distance(
        ${driver.primaryLocation}::geography,
        ST_GeomFromText('POINT(' || ${longitude} || ' ' || ${latitude} || ')', 4326)::geography
      ) / 1000
    `.as('distance_km')
  })
  .from(driver)
  .where(sql`
    ST_DWithin(
      ${driver.primaryLocation}::geography,
      ST_GeomFromText('POINT(' || ${longitude} || ' ' || ${latitude} || ')', 4326)::geography,
      ${driver.serviceRadius} * 1000
    )
  `)
  .orderBy(sql`distance_km`);

  return nearbyDrivers;
};

const saveBreakdownRequest = async (
  data: BreakdownRequestInput
): Promise<number> => {
  const breakdownResult = await DB.insert(breakdownRequest)
    .values({
      userId: data.userId, // Convert to number
      requestType: data.requestType,
      locationAddress: data.locationAddress,
      userLocation: {
        x: data.userLocation.longitude,
        y: data.userLocation.latitude,
      },
      description: data.description || null, // Handle optional field
      status: "pending",
    })
    .returning({ id: breakdownRequest.id });

  // Find and log nearby drivers
  const nearbyDrivers = await findNearbyDrivers(data.userLocation.latitude, data.userLocation.longitude);
  console.log("Nearby drivers:", nearbyDrivers);

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
    .leftJoin(userProfile, eq(breakdownRequest.userId, userProfile.id));
};

export const BreakdownRequestRepository: BreakdownRequestRepositoryType = {
  saveBreakdownRequest,
  getAllBreakdownRequestsWithUserDetails,
  findNearbyDrivers,
};
