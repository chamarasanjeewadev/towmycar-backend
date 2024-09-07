import { eq, and, desc } from "drizzle-orm";
import { DB } from "database"; // Assuming you have a db connection file
import {
  userProfile,
  breakdownRequest,
  driver,
  driverRequest,
  UserProfile,
  BreakdownRequest,
  Driver,
  DriverRequest,
} from "database";
import { DriverInput } from "../dto/driver.dto";

const create = async (data: DriverInput): Promise<number> => {
  const driverResult = await DB.insert(driver)
    .values({
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      vehicleType: data.vehicleType,
      vehicleRegistration: data.vehicleRegistration,
      licenseNumber: data.licenseNumber, // Fixed typo: 'licenseNumbber' to 'licenseNumber'
      serviceRadius: data.serviceRadius,
      primaryLocation: {
        x: data.primaryLocation.longitude,
        y: data.primaryLocation.latitude,
      }, // Assuming your schema accepts this object structure
      workingHours: data.workingHours,
      experienceYears: data.experienceYears,
      insuranceDetails: data.insuranceDetails,
    })
    .returning({ id: driver.id });

  return driverResult[0].id;
};

export interface IDriverRepository {
  create(driverData: DriverInput): Promise<number>;
  findByEmail(email: string): Promise<Driver | null>;
  getDriverRequestsWithInfo(
    driverId: number
  ): Promise<(DriverRequest & { driver: Driver; user: UserProfile })[]>;
  getSpecificDriverRequestWithInfo(
    driverId: number,
    requestId: number
  ): Promise<(DriverRequest & { driver: Driver; user: UserProfile }) | null>;
  updateDriverRequestStatus(driverId: number, requestId: number, status: string): Promise<boolean>;
}

export const DriverRepository: IDriverRepository = {
  create,
  async findByEmail(email: string): Promise<Driver | null> {
    const [foundDriver] = await DB.select()
      .from(driver)
      .where(eq(driver.email, email));
    return foundDriver || null;
  },
//@ts-ignore
  async getDriverRequestsWithInfo(
    driverId: number
  ): Promise<(DriverRequest & { driver: Driver; user: UserProfile })[]> {
    const result = await DB.select({
      driverRequest: {
        id: driverRequest.id,
        requestId: driverRequest.requestId,
        status: driverRequest.status,
        updatedAt: driverRequest.updatedAt,
      },
      driver: {
        id: driver.id,
        name: driver.email,
      },
      user: {
        id: userProfile.id,
        name: userProfile.firstName,
        email: userProfile.email,
      },
    })
      .from(driverRequest)
      .innerJoin(driver, eq(driverRequest.driverId, driver.id))
      .innerJoin(
        breakdownRequest, // assuming breakdownRequest might have geometry fields
        eq(driverRequest.requestId, breakdownRequest.id)
      )
      .innerJoin(userProfile, eq(breakdownRequest.userId, userProfile.id))
      .where(eq(driverRequest.driverId, driverId))
      .orderBy(desc(driverRequest.updatedAt));
    console.log(result);
    return result as unknown as (DriverRequest & { driver: Driver; user: UserProfile })[];

    //   return result.map(({ driverRequest, driver, user }) => ({
    //   ...driverRequest,
    //   driver,
    //   user,
    // }));
  },

  async getSpecificDriverRequestWithInfo(
    driverId: number,
    requestId: number
  ): Promise<(DriverRequest & { driver: Driver; user: UserProfile }) | null> {
    const [result] = await DB.select({
      driverRequest: {
        id: driverRequest.id,
        requestId: driverRequest.requestId,
        status: driverRequest.status,
        updatedAt: driverRequest.updatedAt,
        driverId: driverRequest.driverId,
        assignedAt: driverRequest.assignedAt,
      },
      driver: {
        id: driver.id,
        fullName: driver.fullName,
        email: driver.email,
        phoneNumber: driver.phoneNumber,
        vehicleType: driver.vehicleType,
        vehicleRegistration: driver.vehicleRegistration,
        licenseNumber: driver.licenseNumber,
        serviceRadius: driver.serviceRadius,
        // primaryLocation: driver.primaryLocation,
        workingHours: driver.workingHours,
        experienceYears: driver.experienceYears,
        insuranceDetails: driver.insuranceDetails,
        createdAt: driver.createdAt,
        updatedAt: driver.updatedAt,
      },
      user: {
        id: userProfile.id,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        postcode: userProfile.postcode,
        vehicleRegistration: userProfile.vehicleRegistration,
        mobileNumber: userProfile.mobileNumber,
        // createdAt: userProfile.createdAt,
        // updatedAt: userProfile.createdAt,
      },
    })
      .from(driverRequest)
      .innerJoin(driver, eq(driverRequest.driverId, driver.id))
      .innerJoin(breakdownRequest, eq(driverRequest.requestId, breakdownRequest.id))
      .innerJoin(userProfile, eq(breakdownRequest.userId, userProfile.id))
      .where(
        and(
          eq(driverRequest.driverId, driverId),
          eq(driverRequest.requestId, requestId)
        )
      );

    if (!result) return null;

    return {
      ...result.driverRequest,
      driver: result.driver,
      user: result.user,
    } as DriverRequest & { driver: Driver; user: UserProfile };
  },

  async updateDriverRequestStatus(driverId: number, requestId: number, status: string): Promise<boolean> {
    const result = await DB.update(driverRequest)
      .set({ status })
      .where(
        and(
          eq(driverRequest.driverId, driverId),
          eq(driverRequest.requestId, requestId)
        )
      );
    
    return (result?.rowCount ?? 0) > 0;
  },

  // Add more methods as needed
};
