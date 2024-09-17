import { eq, and, desc, not, or } from "drizzle-orm";
import { DB } from "database";
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
import { DriverInput, DriverProfileDtoType } from "../dto/driver.dto";
import { NotFoundError } from "../utils/error/errors";

interface UpdateAssignmentData {
  status: string;
  estimation?: string; // Change to string
  explanation?: string; // Rename to explanation
}

const create = async (
  data: Pick<DriverInput, "username" | "email">
): Promise<number> => {
  const driverResult = await DB.insert(driver)
    .values({
      email: data.email,
    })
    .returning({ id: driver.id });

  return driverResult[0].id;
};

export interface IDriverRepository {
  create(driverData: Pick<DriverInput, "username" | "email">): Promise<number>;
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
  update(id: number, data: Partial<DriverProfileDtoType>): Promise<Driver>;
  getDriverProfileByEmail(email: string): Promise<Driver | null>;
  getDriverById(id: number): Promise<Driver | null>;
  getUserByRequestId(requestId: number): Promise<UserProfile | null>;
}

export const DriverRepository: IDriverRepository = {
  create,
  async findByEmail(email: string): Promise<Driver | null> {
    const [foundDriver] = await DB.select()
      .from(driver)
      .where(eq(driver.email, email));
    return foundDriver || null;
  },
  async getDriverRequestsWithInfo(
    driverId: number
  ): Promise<(BreakdownAssignment & { driver: Driver; user: UserProfile })[]> {
    const result = await DB.select({
      driverRequest: {
        id: breakdownAssignment.id,
        requestId: breakdownAssignment.requestId,
        status: breakdownAssignment.status,
        estimation: breakdownAssignment.estimation,
        explanation: breakdownAssignment.explanation,
        updatedAt: breakdownAssignment.updatedAt,
        userLocation: breakdownRequest.userLocation,
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
        breakdownRequest,
        eq(breakdownAssignment.requestId, breakdownRequest.id)
      )
      .innerJoin(userProfile, eq(breakdownRequest.userId, userProfile.id))
      .where(eq(breakdownAssignment.driverId, driverId))
      .orderBy(desc(breakdownAssignment.updatedAt));

    return result as unknown as (BreakdownAssignment & {
      driver: Driver;
      user: UserProfile;
    })[];
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
        estimation: breakdownAssignment.estimation,
        explanation: breakdownAssignment.explanation,
        updatedAt: breakdownAssignment.updatedAt,
        driverId: breakdownAssignment.driverId,
        assignedAt: breakdownAssignment.assignedAt,
        userLocation: breakdownRequest.userLocation,
        userStatus: breakdownAssignment.userStatus,
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
    // @ts-ignore
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
      ...(data.estimation !== undefined && { estimation: data.estimation }),
      ...(data.explanation !== undefined && { explanation: data.explanation }),
    };

    // Perform the operation atomically within a transaction
    const result = await DB.transaction(async (tx) => {
      // Check if there's already an accepted assignment
      const existingAcceptedAssignment = await tx
        .select({ id: breakdownAssignment.id })
        .from(breakdownAssignment)
        .where(
          and(
            eq(breakdownAssignment.driverId, driverId),
            eq(breakdownAssignment.requestId, requestId),
            eq(breakdownAssignment.status, 'accepted'),
            eq(breakdownAssignment.userStatus, 'accepted')
          )
        )
        .limit(1);

      if (existingAcceptedAssignment.length > 0) {
        throw new NotFoundError("This assignment is no longer available for update.");
      }

      // Proceed with the update if no accepted assignment exists
      const updatedRows = await tx
        .update(breakdownAssignment)
        .set(updateData)
        .where(
          and(
            eq(breakdownAssignment.driverId, driverId),
            eq(breakdownAssignment.requestId, requestId),
            // eq(breakdownAssignment.status, data.status),
            // eq(breakdownAssignment.userStatus, data.userStatus)
          )
        )
        .returning({ id: breakdownAssignment.id });

      // If no rows were updated, it means the assignment doesn't exist or is not in pending state
      if (updatedRows.length === 0) {
        const existingAssignment = await tx
          .select({ id: breakdownAssignment.id })
          .from(breakdownAssignment)
          .where(
            and(
              eq(breakdownAssignment.driverId, driverId),
              eq(breakdownAssignment.requestId, requestId)
            )
          )
          .limit(1);

        if (existingAssignment.length > 0) {
          throw new NotFoundError("This assignment is no longer available for update.");
        } else {
          throw new Error("The specified assignment does not exist.");
        }
      }

      return true;
    });

    return result;
  },

  async update(
    id: number,
    data: Partial<DriverProfileDtoType>
  ): Promise<Driver> {
    const { primaryLocation, ...restData } = data;
    const updatedDriver = await DB.update(driver)
      .set({
        ...restData,
        primaryLocation: primaryLocation
          ? { x: primaryLocation.longitude, y: primaryLocation.latitude }
          : undefined,
      })
      .where(eq(driver.id, id))
      .returning();
    return updatedDriver[0];
  },

  async getDriverProfileByEmail(email: string): Promise<Driver | null> {
    const [foundDriver] = await DB.select()
      .from(driver)
      .where(eq(driver.email, email));
    return foundDriver || null;
  },

  async getDriverById(id: number): Promise<Driver | null> {
    const [foundDriver] = await DB.select()
      .from(driver)
      .where(eq(driver.id, id));
    return foundDriver || null;
  },

  async getUserByRequestId(requestId: number): Promise<UserProfile | null> {
    const result = await DB.select({
      id: userProfile.id,
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      email: userProfile.email,
      postcode: userProfile.postcode,
      vehicleRegistration: userProfile.vehicleRegistration,
      mobileNumber: userProfile.mobileNumber,
    })
      .from(breakdownRequest)
      .innerJoin(userProfile, eq(breakdownRequest.userId, userProfile.id))
      .where(eq(breakdownRequest.id, requestId))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  },

  // async getUserByRequestId(requestId: number): Promise<UserProfile | null> {
  //   const result = await DB.select({
  //     id: userProfile.id,
  //     firstName: userProfile.firstName,
  //     lastName: userProfile.lastName,
  //     email: userProfile.email,
  //     postcode: userProfile.postcode,
  //     vehicleRegistration: userProfile.vehicleRegistration,
  //     mobileNumber: userProfile.mobileNumber,
  //   })
  //     .from(breakdownRequest)
  //     .innerJoin(userProfile, eq(breakdownRequest.userId, userProfile.id))
  //     .where(eq(breakdownRequest.id, requestId))
  //     .limit(1);

  //   return result.length > 0 ? result[0] : null;
  // },
};
