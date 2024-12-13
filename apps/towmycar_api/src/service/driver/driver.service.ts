import { DriverProfileDtoType } from "../../dto/driver.dto";
import {
  IDriverRepository,
  DriverRepository,
} from "../../repository/driver.repository";

import { VIEW_REQUEST_BASE_URL } from "../../config"; // Add this import at the top of the file
import { Stripe } from "stripe";
import {
  DriverAcceptedEventPayload,
  DriverClosedEventPayload,
  DriverQuotedEventPayload,
  DriverRejectedEventPayload,
  DriverStatus,
  registerNotificationListener,
  TokenService,
} from "@towmycar/common";
import { NotificationType } from "@towmycar/common/src/enums";
import { CloseDriverAssignmentParams } from "./../../types/types";
import { CustomError, ERROR_CODES } from "@towmycar/common";
import EventEmitter from "events";
import { BreakdownRequestService } from "../user/userBreakdownRequest.service";
import {
  mapToUserWithDriver,
  mapToUserWithCustomer,
} from "@towmycar/common/src/mappers/user.mapper";

// Initialize Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20", // Use the latest API version
});

const MINIMUM_PAYMENT_AMOUNT = 50; // $0.50 in cents (minimum allowed by Stripe for USD)

interface UpdateAssignmentData {
  driverStatus: string;
  estimation?: string;
  description?: string;
  explanation?: string;
}

export class DriverService {
  notificationEmitter = null;
  constructor() {
    this.notificationEmitter = new EventEmitter();
    registerNotificationListener(this.notificationEmitter);
  }

  async getDriverByEmail(email: string, repository: IDriverRepository) {
    return repository.findByEmail(email);
  }

  async getDriverRequestWithInfo(driverId: number, requestId: number) {
    const request = await DriverRepository.getSpecificDriverRequestWithInfo(
      driverId,
      requestId
    );

    return request;
  }

  async getDriverRequestsWithInfo(driverId: number) {
    const requests = await DriverRepository.getDriverRequestsWithInfo(driverId);

    return requests;
  }

  async updateBreakdownAssignment(
    driverId: number,
    requestId: number,
    data: UpdateAssignmentData
  ) {
    // Fetch driver details
    // const driverDetails = await DriverRepository.getDriverById(driverId);

    // if (!driverDetails) {
    //   throw new Error(`Driver with id ${driverId} not found`);
    // }

    // Fetch user details
    const driverInfo = await DriverRepository.getSpecificDriverRequestWithInfo(
      driverId,
      requestId
    );
    const customerDetails = await DriverRepository.getCustomerByRequestId(
      requestId
    );

    const userWithDriver = mapToUserWithDriver(driverInfo);
    const userWithCustomer = mapToUserWithCustomer(customerDetails);

    if (!driverInfo) {
      throw new Error(`User not found for request ${requestId}`);
    }

    if (data.driverStatus === DriverStatus.ACCEPTED) {
      const dataToUpdate = {
        driverStatus: data.driverStatus,
      };
      let estimation = null;
      if (!data.estimation) {
        const breakdownAssignment =
          await BreakdownRequestService.getBreakdownAssignmentsByDriverIdAndRequestId(
            Number(driverId),
            Number(requestId)
          );
        estimation = breakdownAssignment?.estimation;
      }

      await this.processPaymentAndUpdateAssignment(
        Number(driverId),
        Number(requestId),
        Number(estimation ?? 5),
        dataToUpdate
      );

      const payload: DriverAcceptedEventPayload = {
        breakdownRequestId: requestId,
        driver: userWithDriver,
        viewRequestLink: `${VIEW_REQUEST_BASE_URL}/user/requests/${requestId}`,
        estimation: +data.estimation,
        user: userWithCustomer,
        newPrice: +data.estimation,
        description: "",
      };
      this.notificationEmitter.emit(NotificationType.DRIVER_ACCEPTED, payload);
      return true;
    }

    const breakdownRequestUpdated =
      await DriverRepository.updatebreakdownAssignment(
        driverId,
        requestId,
        data
      );

    if (data.driverStatus === DriverStatus.QUOTED) {
      const payload: DriverQuotedEventPayload = {
        breakdownRequestId: requestId,
        driver: userWithDriver,
        viewRequestLink: `${VIEW_REQUEST_BASE_URL}/user/requests/${requestId}`,
        estimation: +data.estimation,
        user: userWithCustomer,
        newPrice: +data.estimation,
        description: "",
      };
      this.notificationEmitter.emit(
        NotificationType.DRIVER_QUOTATION_UPDATED,
        payload
      );
    } else if (data.driverStatus === DriverStatus.REJECTED) {
      const payload: DriverRejectedEventPayload = {
        breakdownRequestId: requestId,
        driver: userWithDriver,
        viewRequestLink: `${VIEW_REQUEST_BASE_URL}/user/requests/${requestId}`,
        estimation: +data.estimation,
        user: userWithCustomer,
        newPrice: +data.estimation,
        description: "",
      };
      this.notificationEmitter.emit(NotificationType.DRIVER_REJECTED, payload);
    }
    // else if (data.driverStatus === DriverStatus.CLOSED) {
    //   const token = TokenService.generateUrlSafeToken(requestId, driverId);
    //   const payload: DriverClosedEventPayload = {
    //     breakdownRequestId: requestId,
    //     driver: userWithDriver,
    //     viewRequestLink: `${VIEW_REQUEST_BASE_URL}/user/requests/${requestId}`,
    //     user: userWithCustomer,
    //   };

    //   this.notificationEmitter.emit(NotificationType.DRIVER_CLOSED, payload);
    // }
    else {
      throw new Error("Invalid status or estimation amount");
    }

    // const emailSnsResult = await sendNotification(
    //   process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN || "",
    //   {
    //     type: BaseNotificationType.EMAIL,
    //     subType: notificationType,
    //     payload,
    //   }
    // );
    return breakdownRequestUpdated;
  }

  async getDriverProfileByEmail(email: string) {
    return DriverRepository.getDriverProfileByEmail(email);
  }

  async getDriverWithPaymentMethod(driverId: number) {
    return DriverRepository.getDriverWithPaymentMethod(driverId);
  }

  async closeBreakdownRequestAndUpdateRating(
    closeBreakdownAssignment: CloseDriverAssignmentParams
  ): Promise<void> {
    await DriverRepository.closeBreakdownRequestAndRequestRating(
      closeBreakdownAssignment
    );

    const driverInfo = await DriverRepository.getSpecificDriverRequestWithInfo(
      closeBreakdownAssignment?.driverId,
      closeBreakdownAssignment?.requestId
    );
    const customerDetails = await DriverRepository.getCustomerByRequestId(
      closeBreakdownAssignment?.requestId
    );

    const userWithDriver = mapToUserWithDriver(driverInfo);
    const userWithCustomer = mapToUserWithCustomer(customerDetails);

    const token = TokenService.generateUrlSafeToken(
      closeBreakdownAssignment?.requestId,
      closeBreakdownAssignment?.driverId
    );
    const payload: DriverClosedEventPayload = {
      breakdownRequestId: closeBreakdownAssignment?.requestId,
      driver: userWithDriver,
      viewRequestLink: `${VIEW_REQUEST_BASE_URL}/user/requests/rate/${closeBreakdownAssignment?.requestId}?token=${token}`,
      user: userWithCustomer,
    };

    this.notificationEmitter.emit(NotificationType.DRIVER_CLOSED, payload);
    // TODO: Send notifications to customers
  }

  async processPaymentAndUpdateAssignment(
    driverId: number,
    requestId: number,
    estimation: number,
    dataToUpdate: UpdateAssignmentData
  ): Promise<void> {
    const driver = await this.getDriverWithPaymentMethod(driverId);

    if (!driver?.stripePaymentMethodId) {
      throw new CustomError(
        ERROR_CODES.STRIPE_CARD_NOT_ADDED,
        400,
        "Unable to process payment. Please add a valid payment method."
      );
    }

    // Convert estimation to cents and ensure it meets minimum
    const amount = MINIMUM_PAYMENT_AMOUNT

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        customer: driver.stripeId,
        payment_method: driver.stripePaymentMethodId,
        off_session: true,
        confirm: true,
      });

      if (paymentIntent.status !== "succeeded") {
        throw new CustomError(
          ERROR_CODES.INVALID_PAYMENT_AMOUNT,
          400,
          "Payment failed"
        );
      }

      // Save payment and update assignment
      await DriverRepository.createPaymentAndUpdateAssignment({
        payment: {
          stripePaymentIntentId: paymentIntent.id,
          amount: estimation,
          currency: "usd",
          status: paymentIntent.status,
          driverId,
          requestId,
        },
        assignmentData: dataToUpdate,
      });
    } catch (error) {
      console.error("Payment processing error:", error);
      throw new CustomError(
        ERROR_CODES.PAYMENT_FAILED,
        400,
        error instanceof CustomError 
          ? error.message 
          : "Payment processing failed. Please try again or contact support."
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

  async markNotificationAsSeen(notificationId: number) {
    try {
      await DriverRepository.markNotificationAsSeen(notificationId);
    } catch (error) {
      console.error("Error marking notification as seen:", error);
      throw error;
    }
  }
}
export const getDriverById = async (
  userId: number,
  repository: IDriverRepository
) => {
  try {
    const driverProfile = await repository.getDriverProfileById(userId);

    if (!driverProfile) {
      throw new Error(`Driver with id ${userId} not found`);
    }

    // Check if the driver has a Stripe payment method ID
    if (driverProfile?.driver?.stripePaymentMethodId) {
      try {
        // Retrieve payment method details from Stripe
        const paymentMethod = await stripe.paymentMethods.retrieve(
          driverProfile?.driver?.stripePaymentMethodId
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
};

export const updateDriverProfile = async (
  driverId: number,
  profileData: Partial<DriverProfileDtoType>,
  repository: IDriverRepository
) => {
  // Update the driver's profile with additional information
  const updatedDriver = await repository.update(driverId, profileData);
  return updatedDriver;
};

// export const getDriverByEmail = async (
//   email: string,
//   repository: IDriverRepository
// ) => {
//   return repository.findByEmail(email);
// };

// export const getDriverRequestsWithInfo = async (driverId: number) => {
//   return await DriverRepository.getDriverRequestsWithInfo(driverId);
// };

// export const getDriverProfileByEmail = async (email: string) => {
//   return await DriverRepository.getDriverProfileByEmail(email);
// };

// Add more functions as needed
