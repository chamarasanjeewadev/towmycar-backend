import {
  DB,
  customer,
  user,
  breakdownRequest,
  breakdownAssignment,
  driver,
  Driver,
  Customer,
  eq,
  and,
  desc,
  aliasedTable,
  sql,
  documents,
  Documents,
} from "@towmycar/database";
import { DriverInput, DriverProfileDtoType } from "../dto/driver.dto";
import { NotFoundError, DataBaseError, BreakdownAssignmentDetails, UploadDocumentType, DocumentApprovalStatus } from "@towmycar/common";
import crypto from "crypto"; // Added import for crypto
import {
  CloseDriverAssignmentParams,
} from "./../types/types";
import { logger } from "@towmycar/common";
import { payments } from "@towmycar/database/db-schema";
import { notifications } from "@towmycar/database/db-schema";
import { Notifications } from "@towmycar/database/db-schema";
import {
  UserStatus,
  DriverStatus,
  BreakdownRequestStatus,
  DeliveryNotificationType,
} from "@towmycar/common";
import { maskSensitiveData } from "../utils/maskData";

interface UpdateAssignmentData {
  driverStatus: string;
  estimation?: string; // Change to string
  explanation?: string; // Rename to explanation
}

interface CreatePaymentAndUpdateAssignmentParams {
  payment: {
    stripePaymentIntentId: string;
    amount: number;
    currency: string;
    status: string;
    driverId: number;
    requestId: number;
  };
  assignmentData: UpdateAssignmentData;
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
  ): Promise<BreakdownAssignmentDetails[]>;
  getSpecificDriverRequestWithInfo(
    driverId: number,
    requestId: number
  ): Promise<BreakdownAssignmentDetails | null>;
  updatebreakdownAssignment(
    driverId: number,
    requestId: number,
    data: UpdateAssignmentData
  ): Promise<boolean>;
  update(id: number, data: Partial<DriverProfileDtoType>): Promise<Driver>;
  getDriverProfileByEmail(email: string): Promise<Driver | null>;
  getDriverById(id: number): Promise<Driver | null>;
  getCustomerByRequestId(requestId: number): Promise<{
    id: number;
    userId:number;
    firstName: string;
    lastName: string;
    email: string;
    postcode: string | null;
    mobileNumber: string;
  } | null>;
  updateDriver(
    driverId: number,
    updateData: Partial<Driver>
  ): Promise<Driver | null>;
  getDriverProfileById(userId: number): Promise<any | null>;
  getDriverByRequestId(requestId: number): Promise<
    | (Partial<Driver> & {
        driverId: number;
        userId: number;
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
  closeBreakdownRequestAndRequestRating(
    params: CloseDriverAssignmentParams
  ): Promise<void>;
  createPaymentAndUpdateAssignment({
    payment,
    assignmentData,
  }: CreatePaymentAndUpdateAssignmentParams): Promise<void>;
  getUserNotifications: (userId: number) => Promise<Notifications[]>;
  markNotificationAsSeen: (notificationId: number) => Promise<void>;
  getUnseenNotificationsCount: (userId: number) => Promise<number>;
  uploadDocument(userId: number, documentType: UploadDocumentType, filePath: string):Promise<Documents>;
  getDocuments(userId: number):Promise<Documents[]>;
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
        userLocation: {
          latitude:
            sql<number>`CAST(ST_Y(${breakdownRequest.userLocation}) AS FLOAT)`.as(
              "latitude"
            ),
          longitude:
            sql<number>`CAST(ST_X(${breakdownRequest.userLocation}) AS FLOAT)`.as(
              "longitude"
            ),
        },
        userToLocation: {
          latitude:
            sql<number>`CAST(ST_Y(${breakdownRequest.userToLocation}) AS FLOAT)`.as(
              "latitude"
            ),
          longitude:
            sql<number>`CAST(ST_X(${breakdownRequest.userToLocation}) AS FLOAT)`.as(
              "longitude"
            ),
        },
        createdAt: breakdownAssignment.assignedAt,
        userRequest: {
          id: breakdownRequest.id,
          customerId: breakdownRequest.customerId,
          status: breakdownRequest.status,
          description: breakdownRequest.description,
          regNo: breakdownRequest.regNo,
          weight: breakdownRequest.weight,
          address: breakdownRequest.address,
          toAddress: breakdownRequest.toAddress,
          postCode: breakdownRequest.postCode,
          toPostCode: breakdownRequest.toPostCode,
          createdAt: breakdownRequest.createdAt,
          updatedAt: breakdownRequest.updatedAt,
          make: breakdownRequest.make,
          makeModel: breakdownRequest.model,
          mobileNumber: maskSensitiveData(
            breakdownRequest.mobileNumber,
            sql`${breakdownAssignment.paymentId} IS NOT NULL`
          ),
          requestType: breakdownRequest.requestType,
        },
        driver: {
          id: driver.id,
          firstName: driverUser.firstName,
          lastName: driverUser.lastName,
          email: maskSensitiveData(
            driverUser.email,
            sql`${breakdownAssignment.userStatus} = 'ACCEPTED'`
          ),
          imageUrl: driverUser.imageUrl,
          vehicleType: driver.vehicleType,
          regNo: driver.vehicleRegistration,
          phoneNumber: maskSensitiveData(
            driver.phoneNumber,
            sql`${breakdownAssignment.userStatus} = 'ACCEPTED'`
          ),
          vehicleRegistration: driver.vehicleRegistration,
          licenseNumber: driver.licenseNumber,
          serviceRadius: driver.serviceRadius,
          workingHours: driver.workingHours,
          experienceYears: driver.experienceYears,
          insuranceDetails: driver.insuranceDetails,
          primaryLocation: {
            //@ts-ignore
            latitude:
              sql<number>`CAST(ST_Y(${driver.primaryLocation}) AS FLOAT)`.as(
                "latitude"
              ),
            longitude:
              sql<number>`CAST(ST_X(${driver.primaryLocation}) AS FLOAT)`.as(
                "longitude"
              ),
          },
        },
        customer: {
          id: customer.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: maskSensitiveData(
            user.email,
            sql`${breakdownAssignment.paymentId} IS NOT NULL`
          ),
          mobileNumber: maskSensitiveData(
            breakdownRequest.mobileNumber,
            sql`${breakdownAssignment.paymentId} IS NOT NULL`
          ),
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
        .where(
          and(
            eq(breakdownAssignment.driverId, driverId)
            // Add this condition to exclude CLOSED requests
            // not(eq(breakdownRequest.status, BreakdownRequestStatus.CLOSED))
          )
        )
        .orderBy(desc(breakdownAssignment.updatedAt));
      //@ts-ignore
      return result;
    } catch (error) {
      throw new DataBaseError(
        `Failed to fetch breakdown request by IDs: ${error}`
      );
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
      address: breakdownRequest.address,
      toAddress: breakdownRequest.toAddress,
      postCode: breakdownRequest.postCode,
      toPostCode: breakdownRequest.toPostCode,
      userLocation: {
        latitude:
          sql<number>`CAST(ST_Y(${breakdownRequest.userLocation}) AS FLOAT)`.as(
            "latitude"
          ),
        longitude:
          sql<number>`CAST(ST_X(${breakdownRequest.userLocation}) AS FLOAT)`.as(
            "longitude"
          ),
      },
      userToLocation: {
        latitude:
          sql<number>`CAST(ST_Y(${breakdownRequest.userToLocation}) AS FLOAT)`.as(
            "latitude"
          ),
        longitude:
          sql<number>`CAST(ST_X(${breakdownRequest.userToLocation}) AS FLOAT)`.as(
            "longitude"
          ),
      },
      // userLocation: breakdownRequest.userLocation,
      createdAt: breakdownAssignment.assignedAt,

      userRequest: {
        id: breakdownRequest.id,
        customerId: breakdownRequest.customerId,
        status: breakdownRequest.status,
        description: breakdownRequest.description,
        regNo: breakdownRequest.regNo,
        weight: breakdownRequest.weight,
        address: breakdownRequest.address,
        postCode: breakdownRequest.postCode,
        toPostCode: breakdownRequest.toPostCode,
        toAddress: breakdownRequest.toAddress,
        createdAt: breakdownRequest.createdAt,
        updatedAt: breakdownRequest.updatedAt,
        make: breakdownRequest.make,
        makeModel: breakdownRequest.model,
        mobileNumber: maskSensitiveData(
          breakdownRequest.mobileNumber,
          sql`${breakdownAssignment.paymentId} IS NOT NULL`
        ),
        requestType: breakdownRequest.requestType,
      },
      driver: {
        id: driver.id,
        userId:driverUser.id,
        firstName: driverUser.firstName,
        lastName: driverUser.lastName,
        email: maskSensitiveData(
          driverUser.email,
          sql`${breakdownAssignment.userStatus} = 'ACCEPTED'`
        ),
        imageUrl: driverUser.imageUrl,
        vehicleType: driver.vehicleType,
        regNo: driver.vehicleRegistration,
        phoneNumber: maskSensitiveData(
          driver.phoneNumber,
          sql`${breakdownAssignment.userStatus} = 'ACCEPTED'`
        ),
        vehicleRegistration: driver.vehicleRegistration,
        licenseNumber: driver.licenseNumber,
        serviceRadius: driver.serviceRadius,
        workingHours: driver.workingHours,
        experienceYears: driver.experienceYears,
        insuranceDetails: driver.insuranceDetails,
        primaryLocation: {
          //@ts-ignore
          latitude:
            sql<number>`CAST(ST_Y(${driver.primaryLocation}) AS FLOAT)`.as(
              "latitude"
            ),
          longitude:
            sql<number>`CAST(ST_X(${driver.primaryLocation}) AS FLOAT)`.as(
              "longitude"
            ),
        },
      },
      customer: {
        id: customer.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: maskSensitiveData(
          user.email,
          sql`${breakdownAssignment.paymentId} IS NOT NULL`
        ),
        mobileNumber: maskSensitiveData(
          breakdownRequest.mobileNumber,
          sql`${breakdownAssignment.paymentId} IS NOT NULL`
        ),
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
    // @ts-ignore
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

    try{
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
  }catch(error){
    logger.error("Error in getDriverById:", error);
    throw new DataBaseError(`Failed to get driver by ID: ${error}`);
  }
  },

  async getCustomerByRequestId(requestId: number): Promise<{
    id: number;
    userId:number;
    firstName: string;
    lastName: string;
    email: string;
    postcode: string | null;
    mobileNumber: string;
  } | null> {
    try {
      const result = await DB.select({
        id: customer.id,
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        postcode: customer.postcode,
        mobileNumber: breakdownRequest.mobileNumber,
      })
        .from(breakdownRequest)
        .innerJoin(customer, eq(breakdownRequest.customerId, customer.id))
        .innerJoin(user, eq(user.id, customer.userId))
        .where(eq(breakdownRequest.id, requestId))
        .limit(1);

      return result.length > 0 ? result[0] : null;
    } catch (error) {
      throw new DataBaseError(error);
    }
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
        driverId: number;
        userId: number;
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
      driverId: driver.id,
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: maskSensitiveData(
        user.email,
        sql`${breakdownAssignment.userStatus} = 'ACCEPTED'`
      ),
      phoneNumber: maskSensitiveData(
        driver.phoneNumber,
        sql`${breakdownAssignment.userStatus} = 'ACCEPTED'`
      ),
      vehicleType: driver.vehicleType,
      vehicleRegistration: driver.vehicleRegistration,
      licenseNumber: driver.licenseNumber,
      maxWeight: driver.maxWeight,
      address: driver.address,
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
      driver: {
        ...driver,
        primaryLocation: {
          //@ts-ignore
          latitude:
            sql<number>`CAST(ST_Y(${driver.primaryLocation}) AS FLOAT)`.as(
              "latitude"
            ),
          longitude:
            sql<number>`CAST(ST_X(${driver.primaryLocation}) AS FLOAT)`.as(
              "longitude"
            ),
        },
      },
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
        //@ts-ignore
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
      logger.error("Error updating breakdown request status:", error);
      throw new DataBaseError(
        `Failed to update breakdown request status: ${error}`
      );
    }
  },
  async closeBreakdownRequestAndRequestRating(
    params: CloseDriverAssignmentParams
  ): Promise<void> {
    const { driverId, requestId, markAsCompleted, reason } = params;

    try {
      await DB.transaction(async tx => {
        // Check if the assignment is accepted by both user and driver
        const [assignment] = await tx
          .select({
            userStatus: breakdownAssignment.userStatus,
            driverStatus: breakdownAssignment.driverStatus,
          })
          .from(breakdownAssignment)
          .where(
            and(
              eq(breakdownAssignment.driverId, driverId),
              eq(breakdownAssignment.requestId, requestId)
            )
          )
          .limit(1);

        await tx
          .update(breakdownAssignment)
          .set({
            //@ts-ignore
            driverStatus: DriverStatus.CLOSED.toString(),
            updatedAt: new Date(),
            reasonToClose: reason,
            isCompleted: markAsCompleted,
          })
          .where(
            and(
              eq(breakdownAssignment.driverId, driverId),
              eq(breakdownAssignment.requestId, requestId)
            )
          );

        if (
          assignment &&
          assignment.userStatus === UserStatus.ACCEPTED &&
          assignment.driverStatus === DriverStatus.ACCEPTED &&
          markAsCompleted
        ) {
          // Update breakdown assignment status

          // Update breakdown request status
          await tx
            .update(breakdownRequest)
            .set({
              //@ts-ignore
              status: BreakdownRequestStatus.CLOSED,

              updatedAt: new Date(),
            })
            .where(eq(breakdownRequest.id, requestId));
        }
      });
    } catch (error) {
      logger.error("Error in closeBreakdownRequestAndUpdateRating:", error);
      throw new DataBaseError(
        `Error in closeBreakdownRequestAndUpdateRating:: ${error}`
      );
    }
  },
  async uploadDocument(userId: number, documentType: UploadDocumentType, filePath: string) {
    try {
      const approvalStatus = DocumentApprovalStatus.UPLOADED.toString();
      const result = await DB.insert(documents)
        //@ts-ignore
        .values({
          userId,
          documentType,
          filePath,
          approvalStatus
        })
        // .onConflictDoUpdate({
        //   target: [documents.userId, documents.documentType],
        //   set: {
        //     filePath,
        //   },
        // })
        .returning();
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      logger.error("Error in uploadDocument:", error);
      throw new DataBaseError(`Failed to upload document: ${error}`);
    }
  },
  async getDocuments(userId: number): Promise<Documents[]> {
    return await DB.select().from(documents).where(eq(documents.userId, userId));
  },  
  async createPaymentAndUpdateAssignment({
    payment,
    assignmentData,
  }: CreatePaymentAndUpdateAssignmentParams): Promise<void> {
    await DB.transaction(async tx => {
      // Create payment record
      const [paymentRecord] = await tx
        .insert(payments)
        //@ts-ignore
        .values({
          stripePaymentIntentId: payment.stripePaymentIntentId,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          driverId: payment.driverId,
          requestId: payment.requestId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // Update breakdown assignment with payment reference
      await tx
        .update(breakdownAssignment)
        .set({
          ...assignmentData,
          //@ts-ignore
          paymentId: paymentRecord.id,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(breakdownAssignment.driverId, payment.driverId),
            eq(breakdownAssignment.requestId, payment.requestId)
          )
        );
    });
  },

  async getUserNotifications(userId: number): Promise<Notifications[]> {
    try {
      return await DB.select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.deliveryType, DeliveryNotificationType.PUSH)
          )
        )
        .orderBy(desc(notifications.createdAt));
    } catch (error) {
      logger.error("Error in getUserNotifications:", error);
      throw new DataBaseError(`Failed to get user notifications: ${error}`);
    }
  },
  async markNotificationAsSeen(notificationId: number): Promise<void> {
    try {
      await DB.update(notifications)
        //@ts-ignore
        .set({ isSeen: true })
        .where(eq(notifications.id, notificationId));
    } catch (error) {
      logger.error("Error in markNotificationAsSeen:", error);
      throw new DataBaseError(`Failed to mark notification as seen: ${error}`);
    }
  },
  async getUnseenNotificationsCount(userId: number): Promise<number> {
    try {
      const result = await DB.select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(
          and(eq(notifications.userId, userId), eq(notifications.isSeen, false))
        );
      return Number(result[0].count) || 0;
    } catch (error) {
      logger.error("Error in getUnseenNotificationsCount:", error);
      throw new DataBaseError(
        `Failed to get unseen notifications count: ${error}`
      );
    }
  },
};
