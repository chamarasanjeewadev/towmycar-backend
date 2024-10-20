import {
  DB,
  customer,
  user,
  breakdownRequest,
  breakdownAssignment,
  driver,
  Driver,
  Customer,
  serviceRatings,
  BreakdownAssignment,
} from "@towmycar/database";
import { eq, and, desc, not, or, aliasedTable } from "drizzle-orm";
import { DriverInput, DriverProfileDtoType } from "../dto/driver.dto";
import { NotFoundError, DatabaseError } from "../utils/error/errors";
import crypto from "crypto"; // Added import for crypto
import { BreakdownRequestStatus, DriverStatus, UserStatus } from "../enums";

interface UpdateAssignmentData {
  driverStatus: string;
  estimation?: string; // Change to string
  explanation?: string; // Rename to explanation
}

const create = async (
  data: Pick<DriverInput, "username" | "email">
): Promise<number> => {
  const userResult = await DB.insert(user)
    .values({
      //@ts-ignore
      authId: crypto.randomUUID(), // Generate a unique authId
      email: data.email,
      role: "driver", // Set the role to "driver"
      createdAt: new Date(),
    })
    .returning({ id: user.id });

  const userId = userResult[0].id;

  const driverResult = await DB.insert(driver)
    .values({
      userId: userId,
      createdAt: new Date(),
    })
    .returning({ id: driver.id });

  return driverResult[0].id;
};

export interface IDriverRepository {
  create(driverData: Pick<DriverInput, "username" | "email">): Promise<number>;
  findByEmail(email: string): Promise<Driver | null>;
  getDriverRequestsWithInfo(
    driverId: number
  ): Promise<(BreakdownAssignment & { driver: Driver; user: Customer })[]>;
  getSpecificDriverRequestWithInfo(
    driverId: number,
    requestId: number
  ): Promise<(BreakdownAssignment & { driver: Driver; user: Customer }) | null>;
  updatebreakdownAssignment(
    driverId: number,
    requestId: number,
    data: UpdateAssignmentData
  ): Promise<boolean>;
  update(id: number, data: Partial<DriverProfileDtoType>): Promise<Driver>;
  getDriverProfileByEmail(email: string): Promise<Driver | null>;
  getDriverById(id: number): Promise<Driver | null>;
  getUserByRequestId(requestId: number): Promise<Partial<Customer> | null>;
  updateDriver(
    driverId: number,
    updateData: Partial<Driver>
  ): Promise<Driver | null>;
  getDriverProfileById(userId: number): Promise<any | null>;
  getDriverByRequestId(requestId: number): Promise<
    | (Partial<Driver> & {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        vehicleType: string;
        vehicleRegistration: string;
        licenseNumber: string;
      })
    | null
  >;
  updateDriverPaymentMethod(
    driverId: number,
    paymentMethodId: string
  ): Promise<Driver | null>;
  getDriverWithPaymentMethod(driverId: number): Promise<Driver | null>;
  updateBreakdownRequestStatus(
    requestId: number,
    status: BreakdownRequestStatus
  ): Promise<boolean>;
  closeBreakdownRequestAndUpdateRating(params: {
    driverId: number;
    requestId: number;
    driverRating: number;
    driverFeedback: string;
  }): Promise<void>;
}

export const DriverRepository: IDriverRepository = {
  create,
  async findByEmail(email: string): Promise<any | null> {
    const [foundDriver] = await DB.select()
      .from(driver)
      .innerJoin(user, eq(driver.userId, user.id))
      .where(eq(user.email, email));
    return foundDriver || null;
  },
  async getDriverRequestsWithInfo(
    driverId: number
  ): Promise<BreakdownAssignmentDetails[]> {
    try {
      const driverUser = aliasedTable(user, "driver_user");
      const result = await DB.select({
        id: breakdownAssignment.id,
        requestId: breakdownAssignment.requestId,
        driverStatus: breakdownAssignment.driverStatus,
        userStatus: breakdownAssignment.userStatus,
        estimation: breakdownAssignment.estimation,
        explanation: breakdownAssignment.explanation,
        updatedAt: breakdownAssignment.updatedAt,
        userLocation: breakdownRequest.userLocation,
        createdAt: breakdownAssignment.assignedAt,
        userRequest: {
          id: breakdownRequest.id,
          customerId: breakdownRequest.customerId,
          status: breakdownRequest.status,
          description: breakdownRequest.description,
          regNo: breakdownRequest.regNo,
          weight: breakdownRequest.weight,
          address: breakdownRequest.address,
          createdAt: breakdownRequest.createdAt,
          updatedAt: breakdownRequest.updatedAt,
          make: breakdownRequest.make,
          makeModel: breakdownRequest.model,
          mobileNumber: breakdownRequest.mobileNumber,
          requestType: breakdownRequest.requestType,
        },
        driver: {
          id: driver.id,
          firstName: driverUser.firstName,
          lastName: driverUser.lastName,
          email: driverUser.email,
          imageUrl: driverUser.imageUrl,
          vehicleType: driver.vehicleType,
          regNo: driver.vehicleRegistration,
          vehicleRegistration: driver.vehicleRegistration,
          licenseNumber: driver.licenseNumber,
          serviceRadius: driver.serviceRadius,
          workingHours: driver.workingHours,
          experienceYears: driver.experienceYears,
          insuranceDetails: driver.insuranceDetails,
          primaryLocation: driver.primaryLocation,
        },
        customer: {
          id: customer.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          // authId: user.authId,
          imageUrl: user.imageUrl,
        },
      })
        .from(breakdownAssignment)
        .innerJoin(
          breakdownRequest,
          eq(breakdownAssignment.requestId, breakdownRequest.id)
        )
        .leftJoin(driver, eq(breakdownAssignment.driverId, driver.id))
        .leftJoin(customer, eq(breakdownRequest.customerId, customer.id))
        .leftJoin(driverUser, eq(driverUser.id, driver.userId))
        .leftJoin(user, eq(customer.userId, user.id))
        .where(eq(breakdownAssignment.driverId, driverId))
        .orderBy(desc(breakdownAssignment.updatedAt));

      return result;
    } catch (error) {
      throw new DatabaseError(error);
    }
  },

  async getSpecificDriverRequestWithInfo(
    driverId: number,
    requestId: number
  ): Promise<BreakdownAssignmentDetails | null> {
    const driverUser = aliasedTable(user, "driver_user");
    const [result] = await DB.select({
      id: breakdownAssignment.id,
      requestId: breakdownAssignment.requestId,
      driverStatus: breakdownAssignment.driverStatus,
      userStatus: breakdownAssignment.userStatus,
      estimation: breakdownAssignment.estimation,
      explanation: breakdownAssignment.explanation,
      updatedAt: breakdownAssignment.updatedAt,
      userLocation: breakdownRequest.userLocation,
      createdAt: breakdownAssignment.assignedAt,

      userRequest: {
        id: breakdownRequest.id,
        customerId: breakdownRequest.customerId,
        status: breakdownRequest.status,
        description: breakdownRequest.description,
        regNo: breakdownRequest.regNo,
        weight: breakdownRequest.weight,
        address: breakdownRequest.address,
        createdAt: breakdownRequest.createdAt,
        updatedAt: breakdownRequest.updatedAt,
        make: breakdownRequest.make,
        makeModel: breakdownRequest.model,
        mobileNumber: breakdownRequest.mobileNumber,
        requestType: breakdownRequest.requestType,
      },
      driver: {
        id: driver.id,
        firstName: driverUser.firstName,
        lastName: driverUser.lastName,
        email: driverUser.email,
        imageUrl: driverUser.imageUrl,
        vehicleType: driver.vehicleType,
        regNo: driver.vehicleRegistration,
        vehicleRegistration: driver.vehicleRegistration,
        licenseNumber: driver.licenseNumber,
        serviceRadius: driver.serviceRadius,
        workingHours: driver.workingHours,
        experienceYears: driver.experienceYears,
        insuranceDetails: driver.insuranceDetails,
        primaryLocation: driver.primaryLocation,
      },
      customer: {
        id: customer.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        // authId: user.authId,
        imageUrl: user.imageUrl,
      },
    })
      .from(breakdownAssignment)
      .innerJoin(
        breakdownRequest,
        eq(breakdownAssignment.requestId, breakdownRequest.id)
      )
      .leftJoin(driver, eq(breakdownAssignment.driverId, driver.id))
      .leftJoin(customer, eq(breakdownRequest.customerId, customer.id))
      .leftJoin(user, eq(user.id, customer.userId))
      .leftJoin(driverUser, eq(driverUser.id, driver.userId))
      .where(
        and(
          eq(breakdownAssignment.driverId, driverId),
          eq(breakdownAssignment.requestId, requestId)
        )
      );

    if (!result) return null;
    return result;
  },

  async updatebreakdownAssignment(
    driverId: number,
    requestId: number,
    data: UpdateAssignmentData
  ): Promise<boolean> {
    const updateData: Partial<typeof breakdownAssignment.$inferInsert> = {
      //@ts-ignore
      driverStatus: data.driverStatus,
      ...(data.estimation !== undefined && { estimation: data.estimation }),
      ...(data.explanation !== undefined && { explanation: data.explanation }),
    };

    // Perform the operation atomically within a transaction
    const result = await DB.transaction(async tx => {
      // Check if there's already an accepted assignment
      const existingAcceptedAssignment = await tx
        .select({ id: breakdownAssignment.id })
        .from(breakdownAssignment)
        .where(
          and(
            eq(breakdownAssignment.driverId, driverId),
            eq(breakdownAssignment.requestId, requestId),
            eq(breakdownAssignment.driverStatus, DriverStatus.ACCEPTED),
            eq(breakdownAssignment.userStatus, UserStatus.ACCEPTED)
          )
        )
        .limit(1);

      if (existingAcceptedAssignment.length > 0) {
        throw new NotFoundError(
          "This assignment is no longer available for update."
        );
      }

      // Proceed with the update if no accepted assignment exists
      const updatedRows = await tx
        .update(breakdownAssignment)
        .set(updateData)
        .where(
          and(
            eq(breakdownAssignment.driverId, driverId),
            eq(breakdownAssignment.requestId, requestId)
          )
        )
        .returning({ id: breakdownAssignment.id });

      // If the update was successful and the status is QUOTED, update the breakdownRequest status
      if (updatedRows.length > 0 && data.driverStatus === DriverStatus.QUOTED) {
        await this.updateBreakdownRequestStatus(
          requestId,
          UserStatus.INPROGRESS
        );
      }

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
          throw new NotFoundError(
            "This assignment is no longer available for update."
          );
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
    const { primaryLocation, firstName, lastName, ...restData } = data;
    const prim = {
      x: primaryLocation?.longitude,
      y: primaryLocation?.latitude,
    };

    return await DB.transaction(async tx => {
      // First, get the userId from the driver table
      const [driverRecord] = await tx
        .select({ userId: driver.userId })
        .from(driver)
        .where(eq(driver.id, id));

      if (!driverRecord) {
        throw new Error("Driver not found");
      }

      // Update user table
      if (firstName || lastName) {
        await tx
          .update(user)
          //@ts-ignore
          .set({
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
          })
          .where(eq(user.id, driverRecord.userId));
      }

      // Update driver table
      const [updatedDriver] = await tx
        .update(driver)
        .set({
          ...restData,
          ...(primaryLocation && { primaryLocation: prim }),
        } as any)
        .where(eq(driver.id, id))
        .returning();

      return updatedDriver;
    });
  },

  async getDriverProfileByEmail(email: string): Promise<any | null> {
    const [foundDriver] = await DB.select()
      .from(driver)
      .innerJoin(user, eq(driver.userId, user.id))
      .where(eq(user.email, email));
    return foundDriver || null;
  },

  async getDriverById(id: number): Promise<Driver | null> {
    //@ts-ignore
    const [foundDriver] = await DB.select({
      ...driver,
      firstName: user.firstName,
      lastName: user.lastName,
    })
      .from(driver)
      .innerJoin(user, eq(driver.userId, user.id))
      .where(eq(driver.id, id));
    //@ts-ignore
    return foundDriver || null;
  },

  async getUserByRequestId(requestId: number): Promise<
    | (Partial<Customer> & {
        firstName: string;
        lastName: string;
        email: string;
        postcode: string;
        vehicleRegistration: string;
        mobileNumber: string;
      })
    | null
  > {
    const result = await DB.select({
      id: customer.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      postcode: customer.postcode,
      vehicleRegistration: customer.mobileNumber,
      mobileNumber: customer.mobileNumber,
    })
      .from(breakdownRequest)
      .innerJoin(customer, eq(breakdownRequest.customerId, customer.id))
      .innerJoin(user, eq(user.id, customer.userId))
      .where(eq(breakdownRequest.id, requestId))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  },

  async updateDriver(
    driverId: number,
    updateData: Partial<Driver>
  ): Promise<Driver | null> {
    const result = await DB.update(driver)
      .set(updateData)
      .where(eq(driver.id, driverId))
      .returning();
    return result.length > 0 ? result[0] : null;
  },

  async getDriverByRequestId(requestId: number): Promise<
    | (Partial<Driver> & {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        vehicleType: string;
        vehicleRegistration: string;
        licenseNumber: string;
      })
    | null
  > {
    const result = await DB.select({
      id: driver.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: driver.phoneNumber,
      vehicleType: driver.vehicleType,
      vehicleRegistration: driver.vehicleRegistration,
      licenseNumber: driver.licenseNumber,
    })
      .from(breakdownAssignment)
      .innerJoin(driver, eq(breakdownAssignment.driverId, driver.id))
      .innerJoin(user, eq(user.id, driver.userId))
      .where(eq(breakdownAssignment.requestId, requestId))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  },
  async getDriverProfileById(userId: number): Promise<any | null> {
    //@ts-ignore
    const result = await DB.select({
      ...user,
      driverProfile: driver,
    })
      .from(user)
      .leftJoin(driver, eq(driver.userId, user.id))
      .where(eq(user.id, userId))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  },
  async updateDriverPaymentMethod(
    driverId: number,
    paymentMethodId: string
  ): Promise<Driver | null> {
    const result = await DB.update(driver)
      //@ts-ignore
      .set({ stripePaymentMethodId: paymentMethodId })
      .where(eq(driver.id, driverId))
      .returning();
    return result.length > 0 ? result[0] : null;
  },
  async getDriverWithPaymentMethod(driverId: number): Promise<Driver | null> {
    const [result] = await DB.select()
      .from(driver)
      .where(eq(driver.id, driverId))
      .limit(1);

    return result || null;
  },
  async updateBreakdownRequestStatus(
    requestId: number,
    status: BreakdownRequestStatus
  ): Promise<boolean> {
    try {
      const result = await DB.update(breakdownRequest)
        .set({ status, updatedAt: new Date() })
        .where(
          and(
            eq(breakdownRequest.id, requestId),
            eq(breakdownRequest.status, BreakdownRequestStatus.WAITING)
          )
        )
        .returning({ id: breakdownRequest.id });

      return result.length > 0;
    } catch (error) {
      console.error("Error updating breakdown request status:", error);
      throw new DatabaseError("Failed to update breakdown request status");
    }
  },
  async closeBreakdownRequestAndUpdateRating(params: {
    driverId: number;
    requestId: number;
    driverRating: number;
    driverFeedback: string;
  }): Promise<void> {
    const { driverId, requestId, driverRating, driverFeedback } = params;

    try {
      await DB.transaction(async tx => {
        // Update breakdown assignment status
        await tx
          .update(breakdownAssignment)
          .set({
            driverStatus: DriverStatus.CLOSED,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(breakdownAssignment.driverId, driverId),
              eq(breakdownAssignment.requestId, requestId)
            )
          );

        // Update breakdown request status
        await tx
          .update(breakdownRequest)
          .set({
            status: BreakdownRequestStatus.CLOSED,
            updatedAt: new Date(),
          })
          .where(eq(breakdownRequest.id, requestId));

        // Get the customer ID associated with this request
        const [assignment] = await tx
          .select({
            customerId: breakdownRequest.customerId,
          })
          .from(breakdownRequest)
          .where(eq(breakdownRequest.id, requestId));

        if (!assignment) {
          throw new Error("No breakdown request found for this request ID");
        }

        // Update or insert service rating
        await tx.insert(serviceRatings).values({
          requestId,
          customerId: assignment.customerId,
          driverId,
          driverRating,
          driverFeedback,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        // .onConflictDoUpdate({
        //   target: [serviceRatings.requestId, serviceRatings.driverId],
        //   set: {
        //     driverRating,
        //     driverFeedback,
        //     updatedAt: new Date(),
        //   },
        // });
      });
    } catch (error) {
      console.error("Error in closeBreakdownRequestAndUpdateRating:", error);
      throw new DatabaseError("Failed to close breakdown request", error);
    }
  },
};
