import { eq, and, desc } from "drizzle-orm";
import { DB } from "database"; // Assuming you have a db connection file
import {
  userProfile,
  breakdownRequest,
  driver,
  breakdownAssignment,
  UserProfile,
  BreakdownRequest,
  Driver,
  BreakdownAssignment,
} from "database";
import { DriverInput } from "../dto/driver.dto";

interface UpdateAssignmentData {
  status: string;
  estimation?: number;
  description?: string;
}

const create = async (data: Pick<DriverInput, 'username' | 'email'>): Promise<number> => {
  const driverResult = await DB.insert(driver)
    .values({
      // username: data.username,
      email: data.email,
      // Other fields will be set to their default values or null
    })
    .returning({ id: driver.id });

  return driverResult[0].id;
};

export interface IDriverRepository {
  create(driverData: Pick<DriverInput, 'username' | 'email'>): Promise<number>;
  findByEmail(email: string): Promise<Driver | null>;
  getDriverRequestsWithInfo(
    driverId: number
  ): Promise<(BreakdownAssignment & { driver: Driver; user: UserProfile })[]>;
  getSpecificDriverRequestWithInfo(
    driverId: number,
    requestId: number
  ): Promise<
    (BreakdownAssignment & { driver: Driver; user: UserProfile }) | null
  >;
  updatebreakdownAssignment(
    driverId: number,
    requestId: number,
    data: UpdateAssignmentData
  ): Promise<boolean>;
  update(id: number, data: Partial<DriverInput>): Promise<Driver>;
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
  ): Promise<(BreakdownAssignment & { driver: Driver; user: UserProfile })[]> {
    const result = await DB.select({
      driverRequest: {
        id: breakdownAssignment.id,
        requestId: breakdownAssignment.requestId,
        status: breakdownAssignment.status,
        updatedAt: breakdownAssignment.updatedAt,
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
      .from(breakdownAssignment)
      .innerJoin(driver, eq(breakdownAssignment.driverId, driver.id))
      .innerJoin(
        breakdownRequest, // assuming breakdownRequest might have geometry fields
        eq(breakdownAssignment.requestId, breakdownRequest.id)
      )
      .innerJoin(userProfile, eq(breakdownRequest.userId, userProfile.id))
      .where(eq(breakdownAssignment.driverId, driverId))
      .orderBy(desc(breakdownAssignment.updatedAt));
    console.log(result);
    return result as unknown as (BreakdownAssignment & {
      driver: Driver;
      user: UserProfile;
    })[];

    //   return result.map(({ driverRequest, driver, user }) => ({
    //   ...driverRequest,
    //   driver,
    //   user,
    // }));
  },

  async getSpecificDriverRequestWithInfo(
    driverId: number,
    requestId: number
  ): Promise<
    (BreakdownAssignment & { driver: Driver; user: UserProfile }) | null
  > {
    const [result] = await DB.select({
      driverRequest: {
        id: breakdownAssignment.id,
        requestId: breakdownAssignment.requestId,
        status: breakdownAssignment.status,
        updatedAt: breakdownAssignment.updatedAt,
        driverId: breakdownAssignment.driverId,
        assignedAt: breakdownAssignment.assignedAt,
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
      .from(breakdownAssignment)
      .innerJoin(driver, eq(breakdownAssignment.driverId, driver.id))
      .innerJoin(
        breakdownRequest,
        eq(breakdownAssignment.requestId, breakdownRequest.id)
      )
      .innerJoin(userProfile, eq(breakdownRequest.userId, userProfile.id))
      .where(
        and(
          eq(breakdownAssignment.driverId, driverId),
          eq(breakdownAssignment.requestId, requestId)
        )
      );

    if (!result) return null;

    return {
      ...result.driverRequest,
      driver: result.driver,
      user: result.user,
    } as BreakdownAssignment & { driver: Driver; user: UserProfile };
  },

  async updatebreakdownAssignment(
    driverId: number,
    requestId: number,
    data: UpdateAssignmentData
  ): Promise<boolean> {
    const updateData: Partial<typeof breakdownAssignment.$inferInsert> = {
      status: data.status,
      ...(data.estimation !== undefined && {
        estimatedArrivalTime: data.estimation,
      }),
      ...(data.description !== undefined && { description: data.description }),
    };

    const result = await DB.update(breakdownAssignment)
      .set(updateData)
      .where(
        and(
          eq(breakdownAssignment.driverId, driverId),
          eq(breakdownAssignment.requestId, requestId)
        )
      );

    return (result?.rowCount ?? 0) > 0;
  },

  async update(id: number, data: Partial<DriverInput>): Promise<Driver> {
    const updatedDriver = await DB.update(driver)
      .set(data)
      .where(eq(driver.id, id))
      .returning();
    return updatedDriver[0];
  },

  // Add more methods as needed
};
