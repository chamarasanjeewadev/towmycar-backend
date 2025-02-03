import { DriverProfileDtoType } from "../../dto/driver.dto";
import {
  IDriverRepository,
  DriverRepository,
} from "../../repository/driver.repository";
import { VIEW_REQUEST_BASE_URL } from "../../config"; // Add this import at the top of the file
import { Stripe } from "stripe";
import {
  AdminApprovalRequestPayload,
  ConflictError,
  DataBaseError,
  DriverAcceptedEventPayload,
  DriverApprovalStatus,
  DriverClosedEventPayload,
  DriverQuotedEventPayload,
  DriverRejectedEventPayload,
  DriverStatus,
  emitNotificationEvent,
  getExtension,
  isTrialPeriodExpired,
  logger,
  registerNotificationListener,
  STATUS_CODES,
  TokenService,
  UserWithCustomer,
  UserWithDriver,
} from "@towmycar/common";
import { NotificationType, UploadDocumentType } from "@towmycar/common";
import { CloseDriverAssignmentParams } from "./../../types/types";
import { CustomError, ERROR_CODES } from "@towmycar/common";
import EventEmitter from "events";
import { BreakdownRequestService } from "../user/userBreakdownRequest.service";
import {
  mapToUserWithDriver,
  mapToUserWithCustomer,
} from "@towmycar/common/src/mappers/user.mapper";
import { getViewRequestUrl } from "@towmycar/common/src/utils/view-request-url.utils";
import {
  generateS3FilePath,
  getCloudFrontPresignedUrl,
} from "../../utils/s3utils";
import { UserRepository } from "../../repository/user.repository";
import { driver, Driver, vehicles } from "@towmycar/database";

// Initialize Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20", // Use the latest API version
});

const PER_TRIP_PAYMENT_AMOUNT = 299; // gbp1 in cents (minimum allowed by Stripe for USD)const amountInPence = Math.round(2.99 * 100)
interface UpdateAssignmentData {
  driverStatus: string;
  estimation?: string;
  description?: string;
  explanation?: string;
  vehicleNo?: string;
}

export class DriverService {
  // notificationEmitter = null;
  // constructor() {
  //   this.notificationEmitter = new EventEmitter();
  //   registerNotificationListener(this.notificationEmitter);
  // }

  async getDriverByEmail(email: string, repository: IDriverRepository) {
    return repository.findByEmail(email);
  }

  async getDriverRequestWithInfo(driverId: number, requestId: number) {
    const request = await DriverRepository.getSpecificDriverRequestWithInfo(
      driverId,
      requestId,
    );

    return request;
  }

  async getDriverRequestsWithInfo(driverId: number) {
    const requests = await DriverRepository.getDriverRequestsWithInfo(driverId);
    return requests;
  }

  async requestAdminApproval(driverId: number, data: Partial<DriverProfileDtoType>) {
    let response;
    try {
      // First, update the driver profile
      response = await this.updateDriverProfile(
        driverId,
        { ...data, approvalStatus: DriverApprovalStatus.PENDING },
        DriverRepository,
      );

      // Then, try to send notification
      await this.sendAdminApprovalNotification(driverId);
    } catch (error) {
      logger.error('Error in adminApproval:', error);
     
        throw new DataBaseError(
          'Failed to update driver profile'
        );
    
    }

    return response;
  }

  private async sendAdminApprovalNotification(driverId: number) {
    try {
      const driverInfo = await DriverRepository.getDriverById(driverId);
      const user = await UserRepository.getUserProfileById(driverInfo?.userId);
      const userWithDriver = {
        userId: driverInfo?.userId,
        email: user?.email ?? "",
        firstName: user?.firstName || undefined,
        lastName: user?.lastName || undefined,
        phoneNumber: user?.phoneNumber || undefined,
        driver: {
          id: driverInfo?.id,
          phoneNumber: driverInfo?.phoneNumber,
        },
      };
      const admins = await DriverRepository.getAllAdmins();
      const userWithAdmin = admins.map(admin => ({
        ...admin,
        userId: admin.id,
      }));
      const payload: AdminApprovalRequestPayload = {
        admins: userWithAdmin,
        user: null,
        driver: userWithDriver,
        breakdownRequestId: null,
        viewRequestLink: getViewRequestUrl(
          NotificationType.ADMIN_APPROVAL_REQUEST,
          VIEW_REQUEST_BASE_URL,
          {
            requestId: null,
          },
        ),
      };
      // await this.notificationEmitter.emit(
      //   NotificationType.ADMIN_APPROVAL_REQUEST,
      //   payload,
      // );
    emitNotificationEvent(NotificationType.ADMIN_APPROVAL_REQUEST, payload);
    } catch (error) {
      logger.error('Failed to send admin approval notification:', error);
      // Don't throw error as this is a non-critical operation
    }
  }

  async updateBreakdownAssignment(
    driverId: number,
    requestId: number,
    data: UpdateAssignmentData,
  ) {
    const driverInfo = await DriverRepository.getSpecificDriverRequestWithInfo(
      driverId,
      requestId,
    );
    const customerDetails =
      await DriverRepository.getCustomerByRequestId(requestId);

    const userWithDriver = mapToUserWithDriver(driverInfo);
    const userWithCustomer = mapToUserWithCustomer(customerDetails);

    if (!driverInfo) {
      throw new Error(`User not found for request ${requestId}`);
    }
    if (driverInfo?.driver?.approvalStatus !== DriverApprovalStatus.APPROVED) {
      throw new CustomError(
        ERROR_CODES.ADMIN_APPROVAL_REQUIRED,
        STATUS_CODES.UN_AUTHORISED,
        "You need to get your profile approved first to respond to this job",
      );
     
    }

    if (data.driverStatus === DriverStatus.ACCEPTED) {
      const dataToUpdate = {
        driverStatus: data.driverStatus,
        vehicleNo: data.vehicleNo,
      };
      let estimation = null;
      // check if any other driver has accepted the request
      const otherDriverAccepted =
        await BreakdownRequestService.getBreakdownAssignmentsByRequestId(
          Number(requestId),
        );
      if (
        otherDriverAccepted.find(
          assignment => assignment.driverStatus === DriverStatus.ACCEPTED,
        )
      ) {
        throw new ConflictError(
          "This Job is no longer available, another driver has already accepted this request, you can close this request",
        );
      }

      if (!data.estimation) {
        const breakdownAssignment =
          await BreakdownRequestService.getBreakdownAssignmentsByDriverIdAndRequestId(
            Number(driverId),
            Number(requestId),
          );
        estimation = breakdownAssignment?.estimation;
      }
      // TODO need to lock the database to avoid two drivers do a payment at the same time
      await this.processPaymentAndUpdateAssignment(
        Number(driverId),
        Number(requestId),
        Number(estimation ?? 5),
        dataToUpdate,
      );
      // send notification to customer
      this.sendNotification(requestId, userWithDriver, {...data,estimation}, userWithCustomer);
      return true;
    }
    // if not driver status is accepted, then update the breakdown assignment
    const breakdownRequestUpdated =
      await DriverRepository.updatebreakdownAssignment(
        driverId,
        requestId,
        data,
      );

    if (data.driverStatus === DriverStatus.QUOTED) {
      const payload: DriverQuotedEventPayload = {
        breakdownRequestId: requestId,
        driver: userWithDriver,
        viewRequestLink: getViewRequestUrl(
          NotificationType.DRIVER_QUOTATION_UPDATED,
          VIEW_REQUEST_BASE_URL,
          {
            requestId,
          },
        ),
        estimation: +data.estimation,
        user: userWithCustomer,
        newPrice: +data.estimation,
        explanation: data?.explanation,
      };
      // this.notificationEmitter.emit(
      //   NotificationType.DRIVER_QUOTATION_UPDATED,
      //   payload,
      // );
      emitNotificationEvent(NotificationType.DRIVER_QUOTATION_UPDATED, payload);
    } else if (data.driverStatus === DriverStatus.REJECTED) {
      const payload: DriverRejectedEventPayload = {
        breakdownRequestId: requestId,
        driver: userWithDriver,
        viewRequestLink: getViewRequestUrl(
          NotificationType.DRIVER_REJECTED,
          VIEW_REQUEST_BASE_URL,
          {
            requestId,
          },
        ),
        estimation: +data.estimation,
        user: userWithCustomer,
        newPrice: +data.estimation,
        description: "",
      };
      // this.notificationEmitter.emit(NotificationType.DRIVER_REJECTED, payload);
      emitNotificationEvent(NotificationType.DRIVER_REJECTED, payload);
    } else {
      throw new Error("Invalid status or estimation amount");
    }
    return breakdownRequestUpdated;
  }

  private sendNotification(
    requestId: number,
    userWithDriver: UserWithDriver,
    data: UpdateAssignmentData,
    userWithCustomer: UserWithCustomer,
  ) {
    const payload: DriverAcceptedEventPayload = {
      breakdownRequestId: requestId,
      driver: userWithDriver,
      viewRequestLink: getViewRequestUrl(
        NotificationType.DRIVER_ACCEPTED,
        VIEW_REQUEST_BASE_URL,
        {
          requestId,
        },
      ),
      estimation: +data?.estimation,
      user: userWithCustomer,
      newPrice: +data.estimation,
      description: "",
      vehicleNo: data?.vehicleNo,
    };

    emitNotificationEvent(NotificationType.DRIVER_ACCEPTED, payload);
    
  }

  async getDriverProfileByEmail(email: string) {
    return DriverRepository.getDriverProfileByEmail(email);
  }

  async getDriverWithPaymentMethod(driverId: number) {
    return DriverRepository.getDriverWithPaymentMethod(driverId);
  }

  async uploadDocument(
    userId: number,
    documentType: UploadDocumentType,
    docType: string,
  ) {
    const extention = getExtension(docType);
    const filePath = await generateS3FilePath(userId, documentType, extention);
    // reset admin approval
    return DriverRepository.uploadDocument(userId, documentType, filePath);
  }
  async getCloudfrontPresignedUrl(
    userId: number,
    documentType: UploadDocumentType,
  ) {
    const documents = await DriverRepository.getDocuments(userId);
    const document = documents.filter(
      x => x.documentType === documentType,
    )?.[0];
    if (document?.filePath) {
      const extension = document.filePath.split(".").pop() || '';
  
      const signedUrl = await getCloudFrontPresignedUrl(
        userId,
        documentType as UploadDocumentType,
        `.${extension}`,
      );
      return signedUrl;
    }
    return null;
  }

  async getDocuments(userId: number) {
    //filter documents by updatedDate and sort by updatedDate and send first of each document type
    const documents = await DriverRepository.getDocuments(userId);
    const filteredDocuments = documents.filter(document => document.updatedAt);
    const sortedDocuments = filteredDocuments.sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
    );
    const uniqueDocuments = sortedDocuments.filter(
      (document, index, self) =>
        index === self.findIndex(t => t.documentType === document.documentType),
    );
    return uniqueDocuments;
  }

  async closeBreakdownRequestAndUpdateRating(
    closeBreakdownAssignment: CloseDriverAssignmentParams,
  ): Promise<void> {
    await DriverRepository.closeBreakdownRequestAndRequestRating(
      closeBreakdownAssignment,
    );

    const driverInfo = await DriverRepository.getSpecificDriverRequestWithInfo(
      closeBreakdownAssignment?.driverId,
      closeBreakdownAssignment?.requestId,
    );
    const customerDetails = await DriverRepository.getCustomerByRequestId(
      closeBreakdownAssignment?.requestId,
    );

    const userWithDriver = mapToUserWithDriver(driverInfo);
    const userWithCustomer = mapToUserWithCustomer(customerDetails);

    const token = TokenService.generateUrlSafeToken(
      closeBreakdownAssignment?.requestId,
      closeBreakdownAssignment?.driverId,
    );
    const payload: DriverClosedEventPayload = {
      breakdownRequestId: closeBreakdownAssignment?.requestId,
      driver: userWithDriver,
      viewRequestLink: getViewRequestUrl(
        NotificationType.DRIVER_CLOSED,
        VIEW_REQUEST_BASE_URL,
        {
          requestId: closeBreakdownAssignment?.requestId,
          token,
        },
      ),
      user: userWithCustomer,
    };

    // this.notificationEmitter.emit(NotificationType.DRIVER_CLOSED, payload);
    emitNotificationEvent(NotificationType.DRIVER_CLOSED, payload);
    // TODO: Send notifications to customers
  }

  async processPaymentAndUpdateAssignment(
    driverId: number,
    requestId: number,
    estimation: number,
    dataToUpdate: UpdateAssignmentData,
  ): Promise<void> {
    const driver = await this.getDriverWithPaymentMethod(driverId);
    const isDriverTrialPeriodExpired = isTrialPeriodExpired(driver.createdAt);
    let paymentIntent = null;
    try {
      if (driver.approvalStatus !== DriverApprovalStatus.APPROVED) {
        throw new CustomError(
          ERROR_CODES.DRIVER_NOT_APPROVED,
          STATUS_CODES.UN_AUTHORISED,
          "Driver not approved. Complete your profile first and submit for approval.",
        );
      }
      // if driver is not trial period, then check if they have a stripe payment method
      if (isDriverTrialPeriodExpired && !driver?.stripePaymentMethodId) {
        throw new CustomError(
          ERROR_CODES.STRIPE_CARD_NOT_ADDED,
          STATUS_CODES.UN_AUTHORISED,
          "Unable to process payment. Please add a valid payment method in profile section.",
        );
      }
      // charge for drivers who exceed the trial period, might need to check subscription status later
      if (isDriverTrialPeriodExpired) {
        paymentIntent = await this.getDriverPayment(
          PER_TRIP_PAYMENT_AMOUNT,
          driver,
        );
        if (paymentIntent.status !== "succeeded") {
          throw new CustomError(
            ERROR_CODES.INVALID_PAYMENT_AMOUNT,
            STATUS_CODES.UN_AUTHORISED,
            "Payment Failed",
          );
        }
      }

      // Save payment and update assignment
      await DriverRepository.createPaymentRecordAndUpdateAssignment({
        payment: {
          stripePaymentIntentId: paymentIntent?.id,
          amount: estimation,
          currency: "usd",
          status: paymentIntent?.status,
          driverId,
          requestId,
        },
        assignmentData: dataToUpdate,
      });
    } catch (error) {
      logger.error("Payment processing error:", error);
      throw new CustomError(
        ERROR_CODES.PAYMENT_FAILED,
        STATUS_CODES.UN_AUTHORISED,
        error instanceof CustomError
          ? error.message
          : "Payment processing failed. Please try again or contact support.",
      );
    }
  }

  async getDriverPayment(amount: number, driver: Driver) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "gbp",
        customer: driver.stripeId,
        payment_method: driver.stripePaymentMethodId,
        off_session: true,
        confirm: true,
      });

      if (paymentIntent.status !== "succeeded") {
        throw new CustomError(
          ERROR_CODES.INVALID_PAYMENT_AMOUNT,
          STATUS_CODES.UN_AUTHORISED,
          "Payment failed",
        );
      }
      return paymentIntent;
    } catch (error) {
      logger.error("Payment processing error:", error);
      throw new CustomError(
        ERROR_CODES.PAYMENT_FAILED,
        STATUS_CODES.UN_AUTHORISED,
        error instanceof CustomError
          ? error.message
          : "Payment processing failed. Please try again or contact support.",
      );
    }
  }

  async getDriverNotifications(userId: number) {
    try {
      const notifications = await DriverRepository.getUserNotifications(userId);
      return notifications;
    } catch (error) {
      console.error("Error fetching driver notifications:", error);
      throw error;
    }
  }

  // async markAllNotificationsAsSeen(userId: number) {
  //   await DriverRepository.markAllNotificationsAsSeen(userId);
  // }
  // async markAllChatNotificationsAsSeen(userId: number) {
  //   await DriverRepository.markAllChatNotificationsAsSeen(userId);
  // }

  async markNotificationAsSeen(notificationId: number) {
    try {
      await DriverRepository.markNotificationAsSeen(notificationId);
    } catch (error) {
      console.error("Error marking notification as seen:", error);
      throw error;
    }
  }

  async getDriverById(userId: number) {
    try {
      const driverProfile = await DriverRepository.getDriverProfileById(userId);

      if (!driverProfile) {
        throw new Error(`Driver with id ${userId} not found`);
      }

      // Check if the driver has a Stripe payment method ID
      if (driverProfile?.driver?.stripePaymentMethodId) {
        try {
          // Retrieve payment method details from Stripe
          const paymentMethod = await stripe.paymentMethods.retrieve(
            driverProfile?.driver?.stripePaymentMethodId,
          );

          // Attach payment method details to the driver profile
          return {
            ...driverProfile,
            paymentMethod: {
              brand: paymentMethod.card?.brand,
              last4: paymentMethod.card?.last4,
              expirationMonth: paymentMethod.card?.exp_month,
              expirationYear: paymentMethod.card?.exp_year,
            },
          };
        } catch (stripeError) {
          console.error("Error retrieving Stripe payment method:", stripeError);
          // Return the driver profile without payment method if there's an error
          return driverProfile;
        }
      }

      // Return the driver profile without payment method if no Stripe payment method ID is available
      return driverProfile;
    } catch (error) {
      console.error("Error in getDriverById:", error);
      throw new Error("Failed to retrieve driver profile");
    }
  }

  async updateDriverProfile(
    driverId: number,
    profileData: Partial<DriverProfileDtoType>,
    repository: IDriverRepository,
  ) {
    // Update the driver's profile with additional information
    //if auto approve driver requests is true, then update the driver status to accepted
    if (process.env.AUTO_APPROVE_DRIVER_REQUESTS === "true") {
      profileData.approvalStatus = DriverApprovalStatus.APPROVED;
    }

    const updatedDriver = await repository.update(driverId, profileData);
    return updatedDriver;
  }

  async getDriverDashboardStatsProfile(driverId: number) {
    return DriverRepository.getDriverStatsProfile(driverId);
  }
}
