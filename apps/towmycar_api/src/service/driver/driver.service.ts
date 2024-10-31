import { DriverProfileDtoType } from "../../dto/driver.dto";
import {
  IDriverRepository,
  DriverRepository,
} from "../../repository/driver.repository";

import { VIEW_REQUEST_BASE_URL } from "../../config"; // Add this import at the top of the file
import { Stripe } from "stripe";
import {
  BreakdownRequestStatus,
  DriverStatus,
  EmailNotificationType,
  TokenService,
} from "@towmycar/common";
import { sendNotification } from "@towmycar/common";
import { BaseNotificationType } from "@towmycar/common/src/enums";
import { CloseDriverAssignmentParams } from "./../../types/types";

// Initialize Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20", // Use the latest API version
});

interface UpdateAssignmentData {
  driverStatus: string;
  estimation?: string;
  description?: string;
}

export class DriverService {
  async getDriverByEmail(email: string, repository: IDriverRepository) {
    return repository.findByEmail(email);
  }

  async getDriverRequestWithInfo(
    driverId: number,
    requestId: number
  ) {
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
    const breakdownRequestUpdated =
      await DriverRepository.updatebreakdownAssignment(
        driverId,
        requestId,
        data
      );
    // Fetch driver details
    const driverDetails = await DriverRepository.getDriverById(driverId);

    if (!driverDetails) {
      throw new Error(`Driver with id ${driverId} not found`);
    }

    // Fetch user details
    const userDetails = await DriverRepository.getDriverByRequestId(requestId);

    if (!userDetails) {
      throw new Error(`User not found for request ${requestId}`);
    }

    // Determine the notification type and payload based on the status
    let notificationType: EmailNotificationType;
    let payload: any;

    if (data.driverStatus === DriverStatus.QUOTED) {
      // set request in progress mode since driver quoted....
      await DriverRepository.updateBreakdownRequestStatus(
        requestId,
        BreakdownRequestStatus.QUOTED
      );

      notificationType = EmailNotificationType.DRIVER_QUOTATION_UPDATED_EMAIL;
      payload = {
        requestId,
        driverId,
        user: userDetails,
        newPrice: data.estimation,
        estimation: data.estimation,
        description: data?.description ?? "",
        viewRequestLink: `${VIEW_REQUEST_BASE_URL}/user/view-requests/${requestId}`,
      };

      // Update the breakdown request status to IN_PROGRESS when a driver quotes
    } else if (data.driverStatus === DriverStatus.ACCEPTED) {
      notificationType = EmailNotificationType.DRIVER_ACCEPT_EMAIL;
      payload = {
        requestId,
        driverId,
        user: userDetails,
        status: data.driverStatus,
        viewRequestLink: `${VIEW_REQUEST_BASE_URL}/user/view-requests/${requestId}`,
        driverName: `${""}`,
        driverPhone: driverDetails.phoneNumber,
        driverEmail: "driverDetails.email",
        vehicleModel: driverDetails.vehicleType,
        vehiclePlateNumber: driverDetails.vehicleRegistration,
        estimation: data.estimation,
      };
    } else if (data.driverStatus === DriverStatus.REJECTED) {
      notificationType = EmailNotificationType.DRIVER_REJECT_EMAIL;
      payload = {
        requestId,
        driverId,
        user: userDetails,
        driverStatus: data.driverStatus,
        viewRequestLink: `${VIEW_REQUEST_BASE_URL}/user/view-requests/${requestId}`,
      };
    } else if (data.driverStatus === DriverStatus.CLOSED) {
      const token = TokenService.generateUrlSafeToken(requestId);
      notificationType = EmailNotificationType.RATING_REVIEW_EMAIL;
      payload = {
        requestId,
        driverId,
        user: userDetails,
        status: data.driverStatus,
        viewRequestLink: `${VIEW_REQUEST_BASE_URL}/user/requests/rate/${requestId}?token=${token}`,
      };
    } else {
      throw new Error("Invalid status or estimation amount");
    }

    const emailSnsResult = await sendNotification(
      process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN || "",
      {
        type: BaseNotificationType.EMAIL,
        subType: notificationType,
        payload,
      }
    );
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
    // TODO: Send notifications to customers
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
